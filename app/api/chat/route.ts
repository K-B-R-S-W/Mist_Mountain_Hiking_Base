import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, getVisibleRooms } from "@/lib/repositories";
import { generateGeminiChatResponse } from "@/lib/chatbot/gemini-client";
import { buildSystemPrompt } from "@/lib/chatbot/system-prompt";
import { processFallbackIntent } from "@/lib/chatbot/intent-engine";
import { generateCustomItinerary } from "@/lib/chatbot/itinerary-generator";
import { MIST_MOUNTAIN_FACTS, USD_EXCHANGE_RATE } from "@/lib/chatbot/knowledge-base";
import { logUnansweredQuery } from "@/lib/actions/log-unanswered-query";
import {
  CardPayload,
  ChatApiRequest,
  ChatApiResponse,
  LanguageCode,
  RoomCardPayload,
} from "@/lib/chatbot/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatApiRequest;
    const { messages = [], language = "en", currency = "LKR", sessionId } = body;

    const lastUserMessageObj = [...messages].reverse().find((m) => m.role === "user");
    const rawUserMessage = lastUserMessageObj?.content?.trim() ?? "";

    if (!rawUserMessage) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const words = rawUserMessage.split(/\s+/);
    if (rawUserMessage.length > 2000 || words.length > 500) {
      return NextResponse.json({
        message:
          language === "si"
            ? "කරුණාකර ඔබගේ පණිවිඩය වචන 500කට (අකුරු 2000කට) සීමා කරන්න."
            : "Please shorten your inquiry to under 500 words so I can best assist you.",
        language,
      });
    }

    const userMessage = rawUserMessage;

    const [rooms, settings] = await Promise.all([
      getVisibleRooms().catch(() => []),
      getSiteSettings().catch(() => ({
        hotelName: "Mist Mountain Hiking Base",
        tagline: null,
        phone: "+94 77 123 4567",
        whatsapp: "+94 77 123 4567",
        email: "stay.mistmountain@gmail.com",
        address: MIST_MOUNTAIN_FACTS.location,
        facebook: null,
        instagram: null,
        tiktok: null,
        bookingUrl: null,
        googleMapsUrl: null,
        googlePlaceId: null,
        heroTitle: null,
        heroSubtitle: null,
        seoTitle: null,
        seoDescription: null,
        copyright: null,
        aboutIntro: "",
        aboutDifferent: "",
        aboutLand: "",
        aboutLocation: "",
        aboutWhoFor: "",
        aboutTeam: "",
        aboutSustainability: "",
      })),
    ]);

    const isSinhala =
      language === "si" ||
      /[\u0D80-\u0DFF]/.test(userMessage) ||
      /^(oya|mata|kohomada|monawada|kamara|ganan|dawas|kiyada)/i.test(userMessage);

    const activeLanguage: LanguageCode = isSinhala ? "si" : "en";

    const systemPrompt = buildSystemPrompt({
      rooms,
      settings,
      language: activeLanguage,
    });

    const geminiResult = await generateGeminiChatResponse({
      systemPrompt,
      history: messages.slice(-6).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      userMessage,
      temperature: 0.75,
    });

    const roomCards: RoomCardPayload[] = rooms.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      shortDescription: r.shortDescription,
      basePriceLkr: r.basePrice,
      basePriceUsd: Math.round(r.basePrice / USD_EXCHANGE_RATE),
      maxGuests: r.maxGuests,
      imageUrl: r.primaryImageUrl,
    }));

    const cards: CardPayload[] = [];
    const rawQ = userMessage.trim();
    const cleanQ = rawQ
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .toLowerCase()
      .trim();

    // 1. Check for room list inquiries first (e.g. "what rooms are available", "view rooms", "room types", "කාමර මොනවද තියෙන්නේ")
    if (
      /what\s*(are\s*the\s*)?rooms|available\s*rooms|rooms\s*available|see\s*rooms|show\s*rooms|room\s*types|all\s*rooms|කාමර\s*මොනවද|සියලුම\s*කාමර|කාමර\s*බලන්න/i.test(
        cleanQ
      )
    ) {
      cards.push({ type: "room_list", data: roomCards.slice(0, 4) });
    }
    // 2. Explicit booking / reservation flow
    else if (/book|reserve|reservation|check\s*in|check\s*out|වෙන්කර|වෙන් කර/i.test(cleanQ)) {
      // Find if user mentioned a specific room
      const matchedRoom = rooms.find((r) =>
        cleanQ.includes(r.name.toLowerCase()) || (r.slug && cleanQ.includes(r.slug.toLowerCase()))
      ) || rooms[0];

      cards.push({
        type: "booking_flow",
        data: {
          roomId: matchedRoom?.id,
          roomName: matchedRoom?.name,
          pricePerNightLkr: matchedRoom?.basePrice,
          pricePerNightUsd: matchedRoom ? Math.round(matchedRoom.basePrice / USD_EXCHANGE_RATE) : undefined,
          availableRooms: rooms.map((r) => ({
            id: r.id,
            name: r.name,
            basePriceLkr: r.basePrice,
            basePriceUsd: Math.round(r.basePrice / USD_EXCHANGE_RATE),
            maxGuests: r.maxGuests,
          })),
        },
      });
    } else if (/itinerary|day\s*plan|දින\s*\d+|දින\s*2|දින\s*3|දින\s*1|චාරිකාව|සැලැස්ම|චාරිකා\s*සැලැස්ම|stay\s*plan/i.test(cleanQ)) {
      const nights = /1\s*(night|රාත්‍රී)|one\s*night|දින\s*1/i.test(cleanQ) ? 1 : /3|three|දින\s*3/i.test(cleanQ) ? 3 : 2;
      cards.push({
        type: "itinerary",
        data: generateCustomItinerary(nights, activeLanguage),
      });
    } else if (/trail|hike|hiking|circuit|kukuluwa|temple|pimbura|mountain|හයිකින්|මංපෙත්|කුකුළුවා|විහාර/i.test(cleanQ)) {
      cards.push({
        type: "attraction",
        data: {
          id: "kukuluwa_temple",
          title: activeLanguage === "si" ? "කුකුළුවා රජ මහා විහාරය (ලෙන් විහාරය)" : "Kukuluwa Raja Maha Viharaya",
          eyebrow: activeLanguage === "si" ? "ඓතිහාසික කඳුකර මංපෙත" : "HISTORIC CAVE TEMPLE & RIDGE",
          description:
            activeLanguage === "si"
              ? "මිස්ට් මවුන්ටන් සිට විනාඩි 45ක මඟපෙන්වන්නන් සහිත සුන්දර කඳුකර පා ගමනකින් ඓතිහාසික කුකුළුවා ලෙන් විහාරය, කටාරම් කෙටූ ගල් ලෙන් සහ අංශක 360 කඳුකර දසුන් නැරඹිය හැක."
              : "A guided 45-minute mountain trail from the base to an ancient historic cave temple with panoramic valley views, ancient drip ledges, and quiet meditation rock lookouts.",
          imageUrl: null,
          href: "/experiences",
          badge: "Guided Trail",
        },
      });
    } else if (/room|rooms|tariff|rates|price|cost|කාමර|ගාස්තු/i.test(cleanQ)) {
      cards.push({ type: "room_list", data: roomCards.slice(0, 4) });
    } else if (/spring|pool|water|swim|bath|දිය\s*තටාක|උල්පත්|නාන්න/i.test(cleanQ)) {
      cards.push({
        type: "attraction",
        data: {
          id: "spring_pools",
          title: activeLanguage === "si" ? "ස්වාභාවික උල්පත් දිය තටාක" : "Two Natural Spring Pools",
          eyebrow: activeLanguage === "si" ? "ස්වාභාවික ජලය" : "CHEMICAL-FREE & GRAVITY FED",
          description:
            activeLanguage === "si"
              ? MIST_MOUNTAIN_FACTS.springPools.si
              : MIST_MOUNTAIN_FACTS.springPools.en,
          imageUrl: null,
          href: "/experiences",
          badge: "On Property",
        },
      });
    } else if (/contact|location|where|address|phone|whatsapp|drive|reach|directions|පිහිටීම|කොහොමද\s*එන්නේ|ලිපිනය|දුරකථන|පාර/i.test(cleanQ)) {
      cards.push({
        type: "nav",
        data: {
          label: activeLanguage === "si" ? "සම්බන්ධතා සහ මාර්ග විස්තර" : "Contact & Google Maps",
          href: "/contact",
          description: MIST_MOUNTAIN_FACTS.distanceFromColombo,
        },
      });
    } else if (/group|corporate|team|event|outing|company|සමූහ|ආයතනික/i.test(cleanQ)) {
      cards.push({
        type: "booking_flow",
        data: {
          guests: 10,
          message: "Small corporate group / team building retreat inquiry",
        },
      });
    }

    let responseText = "";
    let quickReplies: string[] = [];

    if (geminiResult && geminiResult.text) {
      responseText = geminiResult.text;

      const needsHandoff =
        /not sure|don't know|cannot answer|contact our team|reach out to our front desk|speak with a human|මම දන්නේ නැත|සම්බන්ධ වන්න/i.test(
          responseText
        );

      if (needsHandoff && settings.whatsapp) {
        cards.push({
          type: "whatsapp_handoff",
          data: {
            reason: "Connect directly with our host team",
            contextSummary: userMessage,
            whatsappNumber: settings.whatsapp,
            prefilledText: `Hi Mist Mountain! I was chatting with your AI Concierge about: "${userMessage}". Could you assist me?`,
          },
        });

        await logUnansweredQuery({
          question: userMessage,
          category: "handoff_needed",
          language: activeLanguage,
          sessionId,
        });
      }

      quickReplies =
        activeLanguage === "si"
          ? ["📅 කාමර වෙන්කරගන්න", "🗺️ දින 2ක චාරිකාව", "🌊 දිය තටාක", "💬 WhatsApp"]
          : ["📅 Book a Room", "🗺️ 2-Day Itinerary", "🌊 Spring Pools", "💬 WhatsApp"];
    } else {
      const fallback = processFallbackIntent({
        userMessage,
        rooms,
        settings,
        language: activeLanguage,
        history: messages,
      });
      responseText = fallback.message;
      if (cards.length === 0 && fallback.cards) {
        cards.push(...fallback.cards);
      }
      quickReplies = fallback.quickReplies ?? [];
    }

    const payload: ChatApiResponse = {
      message: responseText,
      cards: cards.length > 0 ? cards : undefined,
      quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
      language: activeLanguage,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        message:
          "We are temporarily experiencing connection issues. Our team is available directly via WhatsApp or phone:",
        cards: [
          {
            type: "error_fallback",
            data: {
              message: "Please reach us directly for immediate assistance.",
              phone: "+94 77 123 4567",
              whatsapp: "+94 77 123 4567",
            },
          },
        ],
        language: "en",
      },
      { status: 200 }
    );
  }
}
