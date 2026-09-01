"use server";

import { createClient } from "@/lib/supabase/server";

export async function logUnansweredQuery(options: {
  question: string;
  category?: string;
  language?: string;
  sessionId?: string;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("chat_unanswered_logs").insert({
      question: options.question.trim(),
      category: options.category || "general",
      language: options.language || "en",
      session_id: options.sessionId || null,
      is_resolved: false,
    });
  } catch (err) {
    console.error("logUnansweredQuery error:", err);
  }
}
