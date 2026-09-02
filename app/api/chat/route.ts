import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, getVisibleRooms } from "@/lib/repositories";
import { generateGeminiChatResponse } from "@/lib/chatbot/gemini-client";
import { buildSystemPrompt } from "@/lib/chatbot/system-prompt";
import { processFallbackIntent } from "@/lib/chatbot/intent-engine";
import { parseBookingDraftFromText } from "@/lib/chatbot/booking-parser";
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
    let responseText = "";
    let quickReplies: string[] = [];

    if (geminiResult && geminiResult.text) {
      const rawAiText = geminiResult.text;
      const actionMatch = rawAiText.match(/<!--ACTION:([\s\S]*?)-->/i);

      if (actionMatch && actionMatch[1]) {
        try {
          const action = JSON.parse(actionMatch[1].trim());

          if (action.card === "booking_flow") {
            const fallbackParsed = parseBookingDraftFromText(userMessage, rooms);
            const chosenRoom =
              rooms.find(
                (r) =>
                  (action.room && r.name.toLowerCase().includes(action.room.toLowerCase())) ||
                  (action.room && r.slug.toLowerCase().includes(action.room.toLowerCase()))
              ) ||
              rooms.find((r) => r.id === fallbackParsed.roomId) ||
              rooms[0];

            const resolvedCheckIn = action.checkIn || fallbackParsed.checkIn;
            const resolvedCheckOut = action.checkOut || fallbackParsed.checkOut;
            const resolvedGuests =
              typeof action.guests === "number" && action.guests > 0
                ? Math.min(action.guests, chosenRoom?.maxGuests ?? 10)
                : fallbackParsed.guests;

            cards.push({
              type: "booking_flow",
              data: {
                roomId: chosenRoom?.id,
                roomName: chosenRoom?.name,
                pricePerNightLkr: chosenRoom?.basePrice,
                pricePerNightUsd: chosenRoom
                  ? Math.round(chosenRoom.basePrice / USD_EXCHANGE_RATE)
                  : undefined,
                checkIn: resolvedCheckIn,
                checkOut: resolvedCheckOut,
                guests: resolvedGuests,
                guestName: fallbackParsed.guestName,
                email: fallbackParsed.email,
                phone: fallbackParsed.phone,
                availableRooms: rooms.map((r) => ({
                  id: r.id,
                  name: r.name,
                  basePriceLkr: r.basePrice,
                  basePriceUsd: Math.round(r.basePrice / USD_EXCHANGE_RATE),
                  maxGuests: r.maxGuests,
                })),
              },
            });
          } else if (action.card === "room_list") {
            cards.push({ type: "room_list", data: roomCards.slice(0, 4) });
          } else if (action.card === "itinerary") {
            const n = typeof action.nights === "number" ? action.nights : 2;
            cards.push({
              type: "itinerary",
              data: generateCustomItinerary(n, activeLanguage),
            });
          } else if (action.card === "attraction") {
            if (action.id === "spring_pools") {
              cards.push({
                type: "attraction",
                data: {
                  id: "spring_pools",
                  title:
                    activeLanguage === "si"
                      ? "ස්වාභාවික උල්පත් දිය තටාක"
                      : "Two Natural Spring Pools",
                  eyebrow:
                    activeLanguage === "si"
                      ? "ස්වාභාවික ජලය"
                      : "CHEMICAL-FREE & GRAVITY FED",
                  description:
                    activeLanguage === "si"
                      ? MIST_MOUNTAIN_FACTS.springPools.si
                      : MIST_MOUNTAIN_FACTS.springPools.en,
                  imageUrl: null,
                  href: "/experiences",
                  badge: "On Property",
                },
              });
            } else {
              cards.push({
                type: "attraction",
                data: {
                  id: "kukuluwa_temple",
                  title:
                    activeLanguage === "si"
                      ? "කුකුළුවා රජ මහා විහාරය (ලෙන් විහාරය)"
                      : "Kukuluwa Raja Maha Viharaya",
                  eyebrow:
                    activeLanguage === "si"
                      ? "ඓතිහාසික කඳුකර මංපෙත"
                      : "HISTORIC CAVE TEMPLE & RIDGE",
                  description:
                    activeLanguage === "si"
                      ? "මිස්ට් මවුන්ටන් සිට විනාඩි 45ක මඟපෙන්වන්නන් සහිත සුන්දර කඳුකර පා ගමනකින් ඓතිහාසික කුකුළුවා ලෙන් විහාරය, කටාරම් කෙටූ ගල් ලෙන් සහ අංශක 360 කඳුකර දසුන් නැරඹිය හැක."
                      : "A guided 45-minute mountain trail from the base to an ancient historic cave temple with panoramic valley views, ancient drip ledges, and quiet meditation rock lookouts.",
                  imageUrl: null,
                  href: "/experiences",
                  badge: "Guided Trail",
                },
              });
            }
          } else if (action.card === "nav") {
            cards.push({
              type: "nav",
              data: {
                label:
                  activeLanguage === "si"
                    ? "සම්බන්ධතා සහ මාර්ග විස්තර"
                    : "Contact & Google Maps",
                href: "/contact",
                description: MIST_MOUNTAIN_FACTS.distanceFromColombo,
              },
            });
          }
        } catch {}
      }

      responseText = rawAiText.replace(/<!--ACTION:[\s\S]*?-->/gi, "").trim();

      // If Gemini didn't output an action tag, use fallback intent parser as secondary safety net
      if (cards.length === 0) {
        const secondaryCheck = processFallbackIntent({
          userMessage,
          rooms,
          settings,
          language: activeLanguage,
          history: messages,
        });
        if (secondaryCheck.cards && secondaryCheck.cards.length > 0) {
          cards.push(...secondaryCheck.cards);
        }
      }

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
