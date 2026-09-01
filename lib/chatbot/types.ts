export type ChatRole = "user" | "assistant" | "system";

export type LanguageCode = "en" | "si";

export type CurrencyCode = "LKR" | "USD";

export type RoomCardPayload = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  basePriceLkr: number;
  basePriceUsd: number;
  maxGuests: number;
  imageUrl: string | null;
};

export type AttractionCardPayload = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  imageUrl: string | null;
  href: string;
  badge?: string;
};

export type ItineraryDay = {
  dayNumber: number;
  title: string;
  morning: { title: string; desc: string; duration: string };
  afternoon: { title: string; desc: string; duration: string };
  evening: { title: string; desc: string; duration: string };
  highlights: string[];
};

export type ItineraryCardPayload = {
  durationNights: number;
  title: string;
  summary: string;
  days: ItineraryDay[];
};

export type NavCardPayload = {
  label: string;
  href: string;
  description?: string;
};

export type BookingDraftPayload = {
  roomId?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  pricePerNightLkr?: number;
  pricePerNightUsd?: number;
  nights?: number;
  totalLkr?: number;
  totalUsd?: number;
  guestName?: string;
  email?: string;
  phone?: string;
  message?: string;
};

export type BookingVoucherPayload = {
  bookingId: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  createdAt: string;
};

export type WaitlistPayload = {
  roomId?: string;
  roomName?: string;
  checkIn?: string;
  checkOut?: string;
};

export type HandoffPayload = {
  reason: string;
  contextSummary: string;
  whatsappNumber: string;
  prefilledText: string;
};

export type CardPayload =
  | { type: "room"; data: RoomCardPayload }
  | { type: "room_list"; data: RoomCardPayload[] }
  | { type: "attraction"; data: AttractionCardPayload }
  | { type: "itinerary"; data: ItineraryCardPayload }
  | { type: "nav"; data: NavCardPayload }
  | { type: "booking_flow"; data: BookingDraftPayload }
  | { type: "booking_voucher"; data: BookingVoucherPayload }
  | { type: "waitlist"; data: WaitlistPayload }
  | { type: "whatsapp_handoff"; data: HandoffPayload }
  | { type: "error_fallback"; data: { message: string; phone?: string; whatsapp?: string; bookingUrl?: string } };

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  language?: LanguageCode;
  cards?: CardPayload[];
  quickReplies?: string[];
  isVoiceInput?: boolean;
};

export type VoiceState = "idle" | "listening" | "processing" | "speaking" | "error";

export type ChatApiRequest = {
  messages: Array<{ role: ChatRole; content: string }>;
  language: LanguageCode;
  currency: CurrencyCode;
  sessionId: string;
  bookingDraft?: BookingDraftPayload;
};

export type ChatApiResponse = {
  message: string;
  cards?: CardPayload[];
  quickReplies?: string[];
  suggestedNavigation?: string;
  language: LanguageCode;
  unansweredQuery?: boolean;
};
