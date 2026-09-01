import { RoomSummary, SiteSettings } from "@/lib/types/domain";
import { MIST_MOUNTAIN_FACTS, USD_EXCHANGE_RATE } from "./knowledge-base";
import { generateCustomItinerary } from "./itinerary-generator";
import { CardPayload, ChatApiResponse, LanguageCode, RoomCardPayload } from "./types";

export function processFallbackIntent(options: {
  userMessage: string;
  rooms: RoomSummary[];
  settings: SiteSettings;
  language: LanguageCode;
  history?: Array<{ role: string; content: string }>;
}): ChatApiResponse {
  const { userMessage, rooms, settings, language, history = [] } = options;
  const q = userMessage.toLowerCase().trim();

  const isSinhala =
    language === "si" ||
    /[\u0D80-\u0DFF]/.test(userMessage) ||
    /^(oya|mata|kohomada|monawada|kamara|ganan|dawas|kiyada|kauda|kawda)/i.test(q);

  const activeLang: LanguageCode = isSinhala ? "si" : "en";

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
  let message = "";
  let quickReplies: string[] = [];

  // Count past similar greetings/questions to ensure anti-repetition
  const userPastQuestions = history.filter((m) => m.role === "user").map((m) => m.content.toLowerCase());
  const repeatCount = userPastQuestions.filter((past) =>
    /who are you|what are you|about you|කවුද|ඔබ කවුද|oya\s*kawda|oya\s*kauda/i.test(past)
  ).length;

  // 1. Check for booking / reservation intent first
  if (/book|reserve|reservation|availability|check\s*in|check\s*out|වෙන්කර/i.test(q)) {
    const matchedRoom = rooms.find((r) =>
      q.includes(r.name.toLowerCase()) || (r.slug && q.includes(r.slug.toLowerCase()))
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

    message =
      activeLang === "si"
        ? "ඔබගේ දිනයන් සහ අවශ්‍ය කාමරය තෝරා පහසුවෙන්ම වෙන්කරවා ගැනීමේ ඉල්ලීමක් යොමු කරන්න:"
        : "You can check availability and send your reservation inquiry directly below:";

    quickReplies =
      activeLang === "si"
        ? ["🏡 සියලුම කාමර", "📍 පිහිටීම සහ මාර්ගය", "📞 WhatsApp මගින් කතා කරන්න"]
        : ["🏡 View All Rooms", "📍 Location & Driving Route", "📞 Chat on WhatsApp"];

    return { message, cards, quickReplies, language: activeLang };
  }

  // 2. Multi-day stay itinerary planning
  if (/itinerary|day\s*plan|hiking\s*circuit|plan\s*(a\s*)?(stay|trip|tour)|චාරිකා\s*සැලැස්ම/i.test(q)) {
    const nights = /1\s*(night|රාත්‍රී)|one\s*night/i.test(q) ? 1 : /3|three/i.test(q) ? 3 : 2;
    const itinerary = generateCustomItinerary(nights, activeLang);
    cards.push({ type: "itinerary", data: itinerary });

    message =
      activeLang === "si"
        ? `ඔබ වෙනුවෙන් සැකසූ දින ${nights + 1} කඳුකර චාරිකා සැලැස්ම පහතින් දැක්වේ:`
        : `Here is a curated ${nights + 1}-day / ${nights}-night hiking and nature stay plan tailored for you:`;

    quickReplies =
      activeLang === "si"
        ? ["📅 කාමර වෙන්කරවා ගන්න", "🌊 ස්වාභාවික දිය තටාක", "🗺️ කුකුළුවා ලෙන් විහාරය"]
        : ["📅 Check Room Availability", "🌊 Natural Spring Pools", "🗺️ Kukuluwa Temple Trail"];

    return { message, cards, quickReplies, language: activeLang };
  }

  // 3. Room tariffs and listings
  if (/room|rooms|tariff|rates|price|cost|කාමර|ගාස්තු/i.test(q)) {
    cards.push({ type: "room_list", data: roomCards.slice(0, 3) });
    message =
      activeLang === "si"
        ? "මිස්ට් මවුන්ටන් හි ලබාගත හැකි සුවපහසු කාමර සහ ගාස්තු පහතින් දැක්වේ:"
        : "Here are our current rooms and per-night tariffs:";

    quickReplies =
      activeLang === "si"
        ? ["📅 කාමරයක් වෙන්කරගන්න", "🌊 දිය තටාක", "🗺️ හයිකින් චාරිකා"]
        : ["📅 Book a Room", "🌊 Spring Pools", "🗺️ Hiking Itinerary"];

    return { message, cards, quickReplies, language: activeLang };
  }

  // 4. Natural Spring pools
  if (/spring|pool|water|swim|bath|දිය තටාක|නාන්න/i.test(q)) {
    cards.push({
      type: "attraction",
      data: {
        id: "spring_pools",
        title: activeLang === "si" ? "ස්වාභාවික උල්පත් දිය තටාක" : "Two Natural Spring Pools",
        eyebrow: activeLang === "si" ? "ස්වාභාවික ජලය" : "CHEMICAL-FREE & GRAVITY FED",
        description:
          activeLang === "si"
            ? MIST_MOUNTAIN_FACTS.springPools.si
            : MIST_MOUNTAIN_FACTS.springPools.en,
        imageUrl: null,
        href: "/experiences",
        badge: "On Property",
      },
    });

    message =
      activeLang === "si"
        ? "අපගේ දිය තටාක 2ම 100% කඳුකර උල්පත් ජලයෙන් ස්වභාවිකව පිරෙන අතර කිසිදු රසායනික ද්‍රව්‍යයක් භාවිතා නොකෙරේ."
        : "Both of our spring pools are 100% gravity-fed with mountain water, completely chemical-free and refreshing.";

    quickReplies =
      activeLang === "si"
        ? ["📅 කාමර වෙන්කරගන්න", "🗺️ හයිකින් චාරිකා", "📍 පාර අහන්න"]
        : ["📅 Check Availability", "🗺️ Hiking Trails", "📍 How to get there"];

    return { message, cards, quickReplies, language: activeLang };
  }

  // 5. Contact & Location
  if (/contact|location|where|address|phone|whatsapp|drive|reach|කොහොමද එන්නේ|ලිපිනය|දුරකථන/i.test(q)) {
    cards.push({
      type: "nav",
      data: {
        label: activeLang === "si" ? "සම්බන්ධතා සහ මාර්ග විස්තර" : "Contact & Google Maps",
        href: "/contact",
        description: MIST_MOUNTAIN_FACTS.distanceFromColombo,
      },
    });

    message =
      activeLang === "si"
        ? `අප පිහිටා ඇත්තේ ${MIST_MOUNTAIN_FACTS.sinhalaLocation} හි ය. කොළඹ සිට හොරණ - රත්නපුර මාර්ගය ඔස්සේ පැය 2.5කින් පමණ පැමිණිය හැක. දුරකථන: ${settings.phone ?? "+94 77 123 4567"}`
        : `We are located at ${settings.address ?? MIST_MOUNTAIN_FACTS.location}. It's a smooth 2.5-hour drive (~85 km) from Colombo. You can contact our desk directly at ${settings.phone ?? "+94 77 123 4567"}.`;

    quickReplies =
      activeLang === "si"
        ? ["📅 වෙන්කරවා ගන්න", "🏡 කාමර බලන්න", "💬 WhatsApp"]
        : ["📅 Check Availability", "🏡 Explore Rooms", "💬 WhatsApp Chat"];

    return { message, cards, quickReplies, language: activeLang };
  }

  // 6. Identity & Anti-Repetition Fallback Responses
  if (/who are you|what are you|about you|කවුද|ඔබ කවුද|oya\s*kawda|oya\s*kauda/i.test(q) || repeatCount > 0) {
    if (activeLang === "si") {
      const sinhalaVariations = [
        "ආයුබෝවන්! මම මිස්ට් මවුන්ටන් කඳුකර නවාතැන්පොළේ AI සහායකයා වෙමි. කාමර වෙන්කරවා ගැනීම්, ස්වාභාවික දිය තටාක, කුකුළුවා රජ මහා විහාර චාරිකා සහ ආහාර පිළිබඳ තොරතුරු ලබාගැනීමට මට උදවු කළ හැක.",
        "නැවතත් මගෙන් අහනවාද? 😊 මම මිස්ට් මවුන්ටන් හි ඔබගේ ඩිජිටල් සහායකයා. අපගේ පිරිසිදු උල්පත් දිය තටාක හෝ කාමර ගාස්තු ගැන විස්තර දැනගන්න කැමතිද?",
        "මම තවමත් ඔබ වෙනුවෙන් මෙහි සූදානමින් සිටිමි! ඔබට අවශ්‍ය ඕනෑම වේලාවක කාමරයක් වෙන්කරවා ගැනීමට හෝ කඳුකර චාරිකාවක් සැලසුම් කිරීමට මට කියන්න.",
        "ඔබට උදවු කිරීමට මම සතුටින් සූදානම්! අද දින ඔබ බලාපොරොත්තු වන්නේ කාමර වෙන්කරගැනීමක්ද නැතහොත් හයිකින්ග් විස්තරද?",
      ];
      const safeIdx = Math.min(repeatCount, sinhalaVariations.length - 1);
      message = sinhalaVariations[safeIdx] || sinhalaVariations[0] || "";
      quickReplies = ["📅 කාමර වෙන්කරගන්න", "🗺️ දින 2ක චාරිකාව", "🌊 දිය තටාක", "📍 පිහිටීම"];
    } else {
      const englishVariations = [
        "Welcome to Mist Mountain Hiking Base! I can help you with room bookings, our 2 natural spring pools, the Pimbura hiking circuit, authentic dining, and directions. How may I assist your stay?",
        "Asking again? 😊 I'm still your Mist Mountain AI Concierge! Would you like to check out our spring pools, hiking trails, or room availability?",
        "Still here and ready whenever you are! Let me know if you want to book a room, plan an itinerary, or chat with our team on WhatsApp.",
        "Always here to help you experience the best of Mist Mountain! What shall we explore next?",
      ];
      const safeIdx = Math.min(repeatCount, englishVariations.length - 1);
      message = englishVariations[safeIdx] || englishVariations[0] || "";
      quickReplies = ["📅 Book a Stay", "🗺️ 2-Day Itinerary", "🌊 Spring Pools", "📍 Location & Route"];
    }
    return { message, cards, quickReplies, language: activeLang };
  }

  // General default greeting / helper
  message =
    activeLang === "si"
      ? "මිස්ට් මවුන්ටන් වෙත සාදරයෙන් පිළිගනිමු! කාමර වෙන්කරවා ගැනීම්, ස්වාභාවික දිය තටාක හෝ හයිකින්ග් චාරිකා ගැන ඔබට දැනගැනීමට අවශ්‍ය කුමක්ද?"
      : "Welcome to Mist Mountain! Feel free to ask about room availability, our 2 spring pools, guided trails, or dining options.";

  quickReplies =
    activeLang === "si"
      ? ["📅 කාමර වෙන්කරගන්න", "🗺️ දින 2ක චාරිකා සැලැස්ම", "🌊 දිය තටාක", "📍 පිහිටීම"]
      : ["📅 Book a Stay", "🗺️ 2-Day Itinerary", "🌊 Spring Pools", "📍 Location & Route"];

  return { message, cards, quickReplies, language: activeLang };
}
