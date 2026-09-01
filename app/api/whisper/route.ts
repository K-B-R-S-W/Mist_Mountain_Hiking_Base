import { NextRequest, NextResponse } from "next/server";
import { transcribeAudioWithGroqWhisper } from "@/lib/chatbot/groq-whisper-client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const language = (formData.get("language") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No audio file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await transcribeAudioWithGroqWhisper(buffer, "audio.webm", language);

    if (!result || !result.text) {
      return NextResponse.json(
        { error: "Transcription unavailable. Fallback to text mode." },
        { status: 502 }
      );
    }

    return NextResponse.json({ text: result.text });
  } catch (error) {
    console.error("Whisper API route error:", error);
    return NextResponse.json(
      { error: "Audio processing failed." },
      { status: 500 }
    );
  }
}
