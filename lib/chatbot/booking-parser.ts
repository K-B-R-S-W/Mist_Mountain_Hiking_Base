import { RoomSummary } from "@/lib/types/domain";
import { BookingDraftPayload } from "./types";

const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  single: 1,
  solo: 1,
  එක්: 1,
  තනි: 1,
  two: 2,
  couple: 2,
  දෙදෙනෙක්: 2,
  දෙන්නෙක්: 2,
  දෙදෙනෙකුට: 2,
  three: 3,
  තුන්දෙනෙක්: 3,
  "තුන් දෙනෙක්": 3,
  තුන්දෙනෙකුට: 3,
  four: 4,
  හතරදෙනෙක්: 4,
  "හතර දෙනෙක්": 4,
  හතරදෙනෙකුට: 4,
  five: 5,
  පස්දෙනෙක්: 5,
  "පස් දෙනෙක්": 5,
  පස්දෙනෙකුට: 5,
  six: 6,
  හයදෙනෙක්: 6,
  seven: 7,
  eight: 8,
};

const DURATION_WORDS: Record<string, number> = {
  "one night": 1,
  "1 night": 1,
  "1 day": 1,
  දවසක්: 1,
  "දින 1ක්": 1,
  "රාත්‍රී 1ක්": 1,
  "two nights": 2,
  "2 nights": 2,
  "2 days": 2,
  "දවස් දෙකක්": 2,
  "දින දෙකක්": 2,
  "රාත්‍රී 2ක්": 2,
  weekend: 2,
  "three nights": 3,
  "3 nights": 3,
  "3 days": 3,
  "දවස් තුනක්": 3,
  "දින තුනක්": 3,
  "රාත්‍රී 3ක්": 3,
  "four nights": 4,
  "4 nights": 4,
  "4 days": 4,
  "දවස් හතරක්": 4,
  "දින හතරක්": 4,
  "රාත්‍රී 4ක්": 4,
  "five nights": 5,
  "5 nights": 5,
  "5 days": 5,
  "දවස් පහක්": 5,
  "දින පහක්": 5,
  "one week": 7,
  සතියක්: 7,
};

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  ජනවාරි: 0,
  feb: 1,
  february: 1,
  පෙබරවාරි: 1,
  mar: 2,
  march: 2,
  මාර්තු: 2,
  apr: 3,
  april: 3,
  අප්‍රේල්: 3,
  may: 4,
  මැයි: 4,
  jun: 5,
  june: 5,
  ජූනි: 5,
  jul: 6,
  july: 6,
  ජූලි: 6,
  aug: 7,
  august: 7,
  අගෝස්තු: 7,
  sep: 8,
  sept: 8,
  september: 8,
  සැප්තැම්බර්: 8,
  oct: 9,
  october: 9,
  ඔක්තෝබර්: 9,
  nov: 10,
  november: 10,
  නොවැම්බර්: 10,
  dec: 11,
  december: 11,
  දෙසැම්බර්: 11,
};

export function parseBookingDraftFromText(
  text: string,
  rooms: RoomSummary[]
): Partial<BookingDraftPayload> {
  const q = text.toLowerCase();
  const currentYear = new Date().getFullYear();

  // 1. Room matching (Sinhala, Singlish, and English)
  let matchedRoom = rooms.find(
    (r) =>
      q.includes(r.name.toLowerCase()) ||
      (r.slug && q.includes(r.slug.toLowerCase()))
  );

  if (!matchedRoom) {
    if (/triple|ට්‍රිපල්|ත්‍රිත්ව|තෙදෙන/i.test(q)) {
      matchedRoom = rooms.find((r) => /triple/i.test(r.name));
    } else if (/quad|family|quadruple|ක්වාඩ්|පවුලේ|හතර\s*දෙන/i.test(q)) {
      matchedRoom = rooms.find((r) => /quad|family/i.test(r.name));
    } else if (/shared|පොදු|බෙදාගත්/i.test(q)) {
      matchedRoom = rooms.find((r) => /shared/i.test(r.name));
    } else if (/double|ඩබල්|ද්විත්ව/i.test(q)) {
      matchedRoom = rooms.find(
        (r) => /double/i.test(r.name) && !/shared/i.test(r.name)
      );
    }
  }

  if (!matchedRoom) {
    matchedRoom = rooms[0];
  }

  // 2. Guests count extraction
  let guests: number | undefined;

  // Check digit patterns (e.g. "3 guests", "3 දෙනෙක්", "3 denekta", "3 denek", "for 3")
  const digitGuestMatch =
    q.match(/(\d+)\s*(?:guests?|people|persons?|adults?|denekta|denek|දෙනෙක්|දෙනෙකුට|දෙනා|අය)/i) ||
    q.match(/(?:for|with|සඳහා)\s+(\d+)/i) ||
    q.match(/(?:denekta|denek|දෙනෙක්|දෙනෙකුට)\s*(\d+)/i);

  if (digitGuestMatch && digitGuestMatch[1]) {
    const parsed = parseInt(digitGuestMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      guests = parsed;
    }
  }

  // Check word numbers if not matched by digit (e.g. "three guests", "තුන්දෙනෙක්", "couple")
  if (!guests) {
    for (const [word, num] of Object.entries(WORD_TO_NUMBER)) {
      if (new RegExp(`\\b${word}\\b`, "i").test(q) || q.includes(word)) {
        guests = num;
        break;
      }
    }
  }

  if (guests && matchedRoom) {
    guests = Math.min(guests, matchedRoom.maxGuests ?? 10);
  }

  // 3. Nights duration extraction
  let nights = 1;

  // Check digit duration:
  // - "දින 4ක්", "දින 4කට", "dawas 3k", "dawas 3", "4 nights", "4 days"
  // - "4 dawas", "4 දින"
  const digitNightsMatch =
    q.match(/(?:දින|දවස්|රාත්‍රී|dawas|days?|nights?)\s*(\d+)(?:ක්|කට|k)?/i) ||
    q.match(/(\d+)\s*(?:ක්|කට|k)?\s*(?:nights?|night\s*stay|days?|dawas|රාත්‍රී|දින|දවස්)/i) ||
    q.match(/(?:for|සඳහා)\s+(\d+)\s+(?:nights?|days?|දින|දවස්|dawas)/i);

  if (digitNightsMatch && digitNightsMatch[1]) {
    const parsed = parseInt(digitNightsMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      nights = parsed;
    }
  } else {
    for (const [phrase, n] of Object.entries(DURATION_WORDS)) {
      if (q.includes(phrase)) {
        nights = n;
        break;
      }
    }
  }

  // 4. Date parsing (Sinhala, English, and relative)
  let checkInDate: Date | null = null;
  let checkOutDate: Date | null = null;

  const monthKeysRegex = Object.keys(MONTHS).join("|");

  // Range pattern: "from 4th to 8th september" or "september 4 to 8" or "සැප්තැම්බර් 4 සිට 8"
  const rangePattern1 = new RegExp(
    `(?:from|සිට)?\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:to|සිට|දක්වා|-)\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:of\\s+)?(${monthKeysRegex})`,
    "i"
  );
  const rangePattern2 = new RegExp(
    `(${monthKeysRegex})\\s*(\\d{1,2})(?:st|nd|rd|th)?\\s*(?:to|සිට|දක්වා|-)\\s*(\\d{1,2})(?:st|nd|rd|th)?`,
    "i"
  );

  const rMatch1 = q.match(rangePattern1);
  const rMatch2 = q.match(rangePattern2);

  if (rMatch1 && rMatch1[1] && rMatch1[2] && rMatch1[3]) {
    const startDay = parseInt(rMatch1[1], 10);
    const endDay = parseInt(rMatch1[2], 10);
    const month = MONTHS[rMatch1[3].toLowerCase()] ?? 0;

    checkInDate = new Date(currentYear, month, startDay);
    checkOutDate = new Date(currentYear, month, endDay);
    nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  } else if (rMatch2 && rMatch2[1] && rMatch2[2] && rMatch2[3]) {
    const month = MONTHS[rMatch2[1].toLowerCase()] ?? 0;
    const startDay = parseInt(rMatch2[2], 10);
    const endDay = parseInt(rMatch2[3], 10);

    checkInDate = new Date(currentYear, month, startDay);
    checkOutDate = new Date(currentYear, month, endDay);
    nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
  } else {
    // Single start date pattern: "4th september" / "4 වෙනිදා සැප්තැම්බර්"
    const dayMonthPattern = new RegExp(
      `(\\d{1,2})(?:st|nd|rd|th|\\s*වෙනිදා|\\s*වැනිදා)?(?:\\s+(?:of\\s+)?|\\s*)(${monthKeysRegex})`,
      "i"
    );
    // "september 4th" / "සැප්තැම්බර් 4"
    const monthDayPattern = new RegExp(
      `(${monthKeysRegex})\\s*(\\d{1,2})(?:st|nd|rd|th|\\s*වෙනිදා|\\s*වැනිදා)?`,
      "i"
    );

    const dm = q.match(dayMonthPattern);
    const md = q.match(monthDayPattern);

    if (dm && dm[1] && dm[2]) {
      const day = parseInt(dm[1], 10);
      const month = MONTHS[dm[2].toLowerCase()] ?? 0;
      checkInDate = new Date(currentYear, month, day);
    } else if (md && md[1] && md[2]) {
      const month = MONTHS[md[1].toLowerCase()] ?? 0;
      const day = parseInt(md[2], 10);
      checkInDate = new Date(currentYear, month, day);
    } else if (/tomorrow|හෙට/i.test(q)) {
      checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 1);
    }
  }

  // Adjust for past dates to next year
  if (checkInDate) {
    if (checkInDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
      checkInDate.setFullYear(currentYear + 1);
      if (checkOutDate) checkOutDate.setFullYear(currentYear + 1);
    }
  }

  let checkInStr: string | undefined;
  let checkOutStr: string | undefined;

  if (checkInDate && !isNaN(checkInDate.getTime())) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    checkInStr = `${checkInDate.getFullYear()}-${pad(checkInDate.getMonth() + 1)}-${pad(checkInDate.getDate())}`;

    if (!checkOutDate) {
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.max(1, nights));
    }
    checkOutStr = `${checkOutDate.getFullYear()}-${pad(checkOutDate.getMonth() + 1)}-${pad(checkOutDate.getDate())}`;
  }

  // 5. Contact information extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+94|0)\s*(?:7\d{8}|[1-9]\d{7,8})/);
  const nameMatch = text.match(/(?:my name is|i am|i'm|name:\s*)([A-Za-z\s]{2,25})/i);

  return {
    roomId: matchedRoom?.id,
    roomName: matchedRoom?.name,
    pricePerNightLkr: matchedRoom?.basePrice,
    guests: guests ?? (matchedRoom ? Math.min(2, matchedRoom.maxGuests) : 2),
    checkIn: checkInStr,
    checkOut: checkOutStr,
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    guestName: nameMatch && nameMatch[1] ? nameMatch[1].trim() : undefined,
  };
}
