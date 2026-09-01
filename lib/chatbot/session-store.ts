import { ChatMessage, LanguageCode, CurrencyCode } from "./types";

const SESSION_STORAGE_KEY = "mist_mountain_chat_session_v1";
const SESSION_ID_KEY = "mist_mountain_chat_session_id";

export type StoredChatState = {
  sessionId: string;
  messages: ChatMessage[];
  language: LanguageCode;
  currency: CurrencyCode;
  lastUpdated: number;
};

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return "fallback-session";
  }
}

export function loadStoredChatState(): StoredChatState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredChatState;
  } catch {
    return null;
  }
}

export function saveChatState(state: {
  sessionId: string;
  messages: ChatMessage[];
  language: LanguageCode;
  currency: CurrencyCode;
}): void {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredChatState = {
      ...state,
      lastUpdated: Date.now(),
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn("Failed to persist chat session:", e);
  }
}

export function clearChatSession(): string {
  if (typeof window === "undefined") return "server-session";
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    const newSessionId = "sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    sessionStorage.setItem(SESSION_ID_KEY, newSessionId);
    return newSessionId;
  } catch {
    return "new-session";
  }
}
