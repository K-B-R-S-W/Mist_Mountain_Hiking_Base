"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChatMessage,
  CurrencyCode,
  LanguageCode,
  RoomCardPayload,
  VoiceState,
} from "@/lib/chatbot/types";
import {
  getOrCreateSessionId,
  loadStoredChatState,
  saveChatState,
  clearChatSession,
} from "@/lib/chatbot/session-store";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInputBar } from "./chat-input-bar";
import { ChatVoiceGlobe } from "./chat-voice-globe";

const INITIAL_GREETING_EN =
  "Welcome to **Mist Mountain Hiking Base**! 🌿\n\nI can help you check room availability, explore our 2 natural spring pools, plan a hiking circuit to Kukuluwa Raja Maha Viharaya, or build a custom stay itinerary. How may I assist you today?";

const INITIAL_GREETING_SI =
  "**මිස්ට් මවුන්ටන් හයිකින්ග් බේස්** වෙත ඔබව සාදරයෙන් පිළිගනිමු! 🌿\n\nකාමර වෙන්කරවා ගැනීම්, ස්වාභාවික උල්පත් දිය තටාක 2, කුකුළුවා රජ මහා විහාර චාරිකා හෝ කඳුකර චාරිකා සැලසුම් පිළිබඳ තොරතුරු ලබාගැනීමට මට හැකිය. අද ඔබට උදවු කළ හැක්කේ කෙසේද?";

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string>("init");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [currency, setCurrency] = useState<CurrencyCode>("LKR");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Hydrate session storage on mount
  useEffect(() => {
    const currentSessionId = getOrCreateSessionId();
    setSessionId(currentSessionId);

    const stored = loadStoredChatState();
    if (stored && stored.messages.length > 0) {
      setMessages(stored.messages);
      setLanguage(stored.language || "en");
      setCurrency(stored.currency || "LKR");
    } else {
      const initialMsg: ChatMessage = {
        id: "init-welcome",
        role: "assistant",
        content: INITIAL_GREETING_EN,
        createdAt: new Date().toISOString(),
        quickReplies: ["📅 Check Availability", "🗺️ 2-Day Itinerary", "🌊 Spring Pools", "📍 Directions"],
      };
      setMessages([initialMsg]);
      setQuickReplies(initialMsg.quickReplies ?? []);
    }
  }, []);

  // Save session state on message update
  useEffect(() => {
    if (sessionId !== "init" && messages.length > 0) {
      saveChatState({
        sessionId,
        messages,
        language,
        currency,
      });
    }
  }, [messages, language, currency, sessionId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      language,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsTyping(true);
    setQuickReplies([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          language,
          currency,
          sessionId,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: "assistant-" + Date.now(),
        role: "assistant",
        content: data.message ?? "Here is what I found for you:",
        createdAt: new Date().toISOString(),
        cards: data.cards,
        quickReplies: data.quickReplies,
        language: data.language ?? language,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.quickReplies) setQuickReplies(data.quickReplies);
      if (data.language && data.language !== language) setLanguage(data.language);

      // If voice mode is active, optionally play audio synthesis
      if (isVoiceMode && typeof window !== "undefined" && "speechSynthesis" in window) {
        setVoiceState("speaking");
        const utterance = new SpeechSynthesisUtterance(data.message.replace(/[\*\#\_]/g, ""));
        utterance.rate = 1.0;
        utterance.onend = () => setVoiceState("idle");
        utterance.onerror = () => setVoiceState("idle");
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "Sorry, I had trouble reaching the base. Please reach out via WhatsApp or phone below:",
          createdAt: new Date().toISOString(),
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
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    const newId = clearChatSession();
    setSessionId(newId);
    const greeting = language === "si" ? INITIAL_GREETING_SI : INITIAL_GREETING_EN;
    const defaultChips =
      language === "si"
        ? ["📅 කාමර වෙන්කරගන්න", "🗺️ දින 2ක චාරිකාව", "🌊 දිය තටාක", "📍 පිහිටීම"]
        : ["📅 Check Availability", "🗺️ 2-Day Itinerary", "🌊 Spring Pools", "📍 Directions"];

    setMessages([
      {
        id: "init-" + Date.now(),
        role: "assistant",
        content: greeting,
        createdAt: new Date().toISOString(),
        quickReplies: defaultChips,
      },
    ]);
    setQuickReplies(defaultChips);
  };

  const handleToggleLanguage = () => {
    const next = language === "en" ? "si" : "en";
    setLanguage(next);
  };

  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === "LKR" ? "USD" : "LKR"));
  };

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const handleSelectRoom = (room: RoomCardPayload) => {
    handleSendMessage(`I'd like to check availability and book the ${room.name}.`);
  };

  // Voice Mode Handling
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        setVoiceState("processing");

        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "audio.webm");
          formData.append("language", language);

          const res = await fetch("/api/whisper", {
            method: "POST",
            body: formData,
          });

          const json = await res.json();
          if (json.text) {
            setVoiceTranscript(json.text);
            await handleSendMessage(json.text);
          } else {
            setVoiceState("error");
          }
        } catch {
          setVoiceState("error");
        }
      };

      mediaRecorder.start();
      setVoiceState("listening");
    } catch {
      setVoiceState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleToggleVoiceMode = () => {
    if (isVoiceMode) {
      stopRecording();
      setIsVoiceMode(false);
      setVoiceState("idle");
    } else {
      setIsVoiceMode(true);
      startRecording();
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-background/95 shadow-2xl backdrop-blur-md">
      <ChatHeader
        language={language}
        currency={currency}
        isVoiceMode={isVoiceMode}
        onToggleLanguage={handleToggleLanguage}
        onToggleCurrency={handleToggleCurrency}
        onToggleVoiceMode={handleToggleVoiceMode}
        onResetChat={handleResetChat}
        onClose={onClose}
      />

      {isVoiceMode ? (
        <ChatVoiceGlobe
          state={voiceState}
          transcript={voiceTranscript}
          onClose={() => setIsVoiceMode(false)}
        />
      ) : (
        <>
          <ChatMessageList
            messages={messages}
            currency={currency}
            sessionId={sessionId}
            isTyping={isTyping}
            quickReplies={quickReplies}
            onSelectQuickReply={handleSendMessage}
            onSelectRoom={handleSelectRoom}
            onNavigate={handleNavigate}
            onBookStay={() => handleSendMessage("Can you plan a 2-day stay itinerary for me?")}
          />

          <ChatInputBar
            onSendMessage={handleSendMessage}
            onStartVoice={handleToggleVoiceMode}
            disabled={isTyping}
            language={language}
          />
        </>
      )}
    </div>
  );
}
