import "server-only";

function getGroqApiKeys(): string[] {
  const keys = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY,
  ]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k && k.length > 5));

  return Array.from(new Set(keys));
}

export async function transcribeAudioWithGroqWhisper(
  audioBuffer: Buffer,
  filename = "audio.webm",
  language?: string
): Promise<{ text: string; keyIndexUsed: number } | null> {
  const keys = getGroqApiKeys();
  if (keys.length === 0) {
    return null;
  }

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      const formData = new FormData();
      const uint8 = new Uint8Array(audioBuffer);
      const blob = new Blob([uint8], { type: "audio/webm" });
      formData.append("file", blob, filename);
      formData.append("model", "whisper-large-v3");
      formData.append("temperature", "0");
      if (language) {
        formData.append("language", language);
      }

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (response.status === 429 || response.status === 402 || response.status === 403) {
        console.warn(`Groq Whisper API key #${i + 1} hit status ${response.status}. Trying next key...`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Groq Whisper key #${i + 1} failed (${response.status}): ${errorText}`);
        continue;
      }

      const result = (await response.json()) as { text?: string };
      if (result.text && result.text.trim().length > 0) {
        return { text: result.text.trim(), keyIndexUsed: i };
      }
    } catch (err) {
      console.error(`Groq Whisper key #${i + 1} error:`, err);
    }
  }

  return null;
}
