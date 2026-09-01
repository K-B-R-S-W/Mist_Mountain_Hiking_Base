import "server-only";

type GeminiMessage = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
      role?: string;
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function getGeminiApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY,
  ]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k && k.length > 5));

  return Array.from(new Set(keys));
}

export async function generateGeminiChatResponse(options: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  temperature?: number;
}): Promise<{ text: string; keyIndexUsed: number } | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    return null;
  }

  const contents: GeminiMessage[] = [];

  for (const item of options.history.slice(-8)) {
    contents.push({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: options.userMessage }],
  });

  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: options.systemPrompt }],
            },
            generationConfig: {
              temperature: options.temperature ?? 0.7,
              topP: 0.9,
              topK: 40,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (response.status === 429 || response.status === 403 || response.status === 402) {
          console.warn(`Gemini API key #${i + 1} (${model}) hit rate-limit or quota error (${response.status}). Failing over...`);
          break;
        }

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`Gemini API key #${i + 1} (${model}) returned status ${response.status}: ${errText}`);
          continue;
        }

        const data = (await response.json()) as GeminiGenerateResponse;
        const candidate = data.candidates?.[0];
        const outputText = candidate?.content?.parts?.map((p) => p.text ?? "").join("").trim();

        if (outputText && outputText.length > 0) {
          return { text: outputText, keyIndexUsed: i };
        }
      } catch (err) {
        console.error(`Gemini call failed on key index ${i} with model ${model}:`, err);
      }
    }
  }

  return null;
}
