export async function callAnthropic(
  messages: { role: string; content: string }[],
  maxTokens: number,
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    throw new Error("Missing ANTHROPIC_API_KEY in environment variables");

  const apiUrl = "https://api.anthropic.com/v1/complete";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      model: "claude-1.3",
      max_tokens_to_sample: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Anthropic API error: ${errorDetails}`);
  }

  return response.json();
}
