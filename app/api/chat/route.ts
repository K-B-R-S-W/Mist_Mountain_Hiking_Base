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
    const q = userMessage.toLowerCase();

    if (/itinerary|plan|schedule|days|nights|trip|චාරිකා|සැලැස්ම|දින/i.test(q)) {
      const nights = /1\s*(night|රාත්‍රී)|one\s*night/i.test(q) ? 1 : /3|three/i.test(q) ? 3 : 2;
      cards.push({
        type: "itinerary",
        data: generateCustomItinerary(nights, activeLanguage),
      });
    } else if (/book|reserve|reservation|dates|availability|check in|check out|වෙන්කර/i.test(q)) {
      cards.push({
        type: "booking_flow",
        data: {
          roomId: rooms[0]?.id,
          roomName: rooms[0]?.name,
          pricePerNightLkr: rooms[0]?.basePrice,
          pricePerNightUsd: rooms[0] ? Math.round(rooms[0].basePrice / USD_EXCHANGE_RATE) : undefined,
          availableRooms: rooms.map((r) => ({
            id: r.id,
            name: r.name,
            basePriceLkr: r.basePrice,
            basePriceUsd: Math.round(r.basePrice / USD_EXCHANGE_RATE),
            maxGuests: r.maxGuests,
          })),
        },
      });
    } else if (/room|rooms|stay|sleep|rate|price|tariff|cost|bed|කාමර|ගාස්තු/i.test(q)) {
      cards.push({ type: "room_list", data: roomCards.slice(0, 3) });
    } else if (/spring|pool|water|swim|bath|දිය තටාක|නාන්න/i.test(q)) {
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
    } else if (/temple|kukuluwa|cave|කුකුළුවා|ලෙන් විහාර/i.test(q)) {
      cards.push({
        type: "attraction",
        data: {
          id: "kukuluwa_temple",
          title: activeLanguage === "si" ? "කුකුළුවා රජ මහා විහාරය" : "Kukuluwa Raja Maha Viharaya",
          eyebrow: activeLanguage === "si" ? "ඓතිහාසික ලෙන් විහාරය" : "HISTORIC CAVE TEMPLE",
          description:
            activeLanguage === "si"
              ? "මනරම් කඳුකර මිටියාවත සහ ලෙන් විහාර පරිශ්‍රය වෙත විනාඩි 45ක මඟපෙන්වන්නන් සහිත පා ගමන."
              : "Ancient cave temple with panoramic mountain valley views, drip ledges, and quiet meditation rock lookouts. Guided 45-minute mountain trail from the base.",
          imageUrl: null,
          href: "/experiences",
          badge: "45 min trail",
        },
      });
    } else if (/group|corporate|team|event|outing|company|සමූහ|ආයතනික/i.test(q)) {
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
