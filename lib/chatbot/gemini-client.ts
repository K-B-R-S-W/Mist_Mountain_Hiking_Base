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

type KeyCircuitState = {
  cooldownUntil: number;
  consecutiveFailures: number;
  lastUsedAt: number;
};

// Global in-memory circuit breaker state across requests in the Node / serverless process
const keyCircuitStates = new Map<string, KeyCircuitState>();

const DEFAULT_RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown for 429
const BACKOFF_MULTIPLIER_MAX_MS = 5 * 60 * 1000; // 5 minutes max backoff

function getGeminiApiKeys(): string[] {
  const keys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ]
    .map((k) => k?.trim())
    .filter((k): k is string => Boolean(k && k.length > 5));

  return Array.from(new Set(keys));
}

function getMaskedKey(key: string): string {
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export async function generateGeminiChatResponse(options: {
  systemPrompt: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  userMessage: string;
  temperature?: number;
}): Promise<{ text: string; keyIndexUsed: number } | null> {
  const allKeys = getGeminiApiKeys();
  if (allKeys.length === 0) {
    return null;
  }

  const now = Date.now();

  // Initialize state map for any new keys
  for (const k of allKeys) {
    if (!keyCircuitStates.has(k)) {
      keyCircuitStates.set(k, {
        cooldownUntil: 0,
        consecutiveFailures: 0,
        lastUsedAt: 0,
      });
    }
  }

  // Separate healthy keys from cooling-down keys
  const indexedKeys = allKeys.map((key, index) => ({
    key,
    index,
    state: keyCircuitStates.get(key)!,
  }));

  const activeHealthyKeys = indexedKeys.filter((k) => now >= k.state.cooldownUntil);
  const coolingDownKeys = indexedKeys
    .filter((k) => now < k.state.cooldownUntil)
    .sort((a, b) => a.state.cooldownUntil - b.state.cooldownUntil);

  // If healthy keys are available, prioritize them. If all are in cooldown, try the one expiring soonest.
  const candidateKeys =
    activeHealthyKeys.length > 0 ? activeHealthyKeys : coolingDownKeys;

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

  const models = ["gemini-3.6-flash"];

  for (const candidate of candidateKeys) {
    const { key, index, state } = candidate;
    const masked = getMaskedKey(key);

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
              maxOutputTokens: 2048,
            },
          }),
        });

        // Handle Rate-limiting (429), Quota Exceeded (403/402)
        if (response.status === 429 || response.status === 403 || response.status === 402) {
          const retryAfterHeader = response.headers.get("retry-after");
          let cooldownDuration = DEFAULT_RATE_LIMIT_COOLDOWN_MS;

          if (retryAfterHeader) {
            const parsed = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsed) && parsed > 0) {
              cooldownDuration = parsed * 1000;
            }
          } else {
            // Exponential backoff up to 5 mins based on consecutive hits
            const multiplier = Math.min(Math.pow(2, state.consecutiveFailures), 5);
            cooldownDuration = Math.min(
              DEFAULT_RATE_LIMIT_COOLDOWN_MS * multiplier,
              BACKOFF_MULTIPLIER_MAX_MS
            );
          }

          state.consecutiveFailures += 1;
          state.cooldownUntil = Date.now() + cooldownDuration;
          state.lastUsedAt = Date.now();

          console.warn(
            `[Gemini CircuitBreaker] API key #${index + 1} (${masked}) hit status ${response.status}. Putting in cooldown for ${Math.round(cooldownDuration / 1000)}s until ${new Date(state.cooldownUntil).toLocaleTimeString()}. Immediately switching to next key...`
          );
          break; // Break model loop, jump straight to next candidate key
        }

        if (!response.ok) {
          const errText = await response.text();
          console.warn(
            `[Gemini CircuitBreaker] API key #${index + 1} (${masked}) returned status ${response.status}: ${errText}`
          );
          continue;
        }

        const data = (await response.json()) as GeminiGenerateResponse;
        const outCandidate = data.candidates?.[0];
        const outputText = outCandidate?.content?.parts?.map((p) => p.text ?? "").join("").trim();

        if (outputText && outputText.length > 0) {
          // Reset failure counter on successful execution
          state.consecutiveFailures = 0;
          state.cooldownUntil = 0;
          state.lastUsedAt = Date.now();

          return { text: outputText, keyIndexUsed: index };
        }
      } catch (err) {
        console.error(
          `[Gemini CircuitBreaker] Error on API key #${index + 1} (${masked}) with model ${model}:`,
          err
        );
      }
    }
  }

  return null;
}
