// utils/aiml.ts
export async function callAIML(
  messages: Message[],
  maxTokens: number,
): Promise<string> {
  if (!process.env.AIML_API_KEY) {
    throw new Error("AIML_API_KEY is not configured");
  }

  try {
    const response = await fetch(AIML_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIML_API_KEY}`,
      },
      body: JSON.stringify({
        model: "chatgpt-4o-latest",
        messages,
        max_tokens: maxTokens,
        temperature: 0.5,
        top_p: 1,
        stop: null,
        stream: false,
      }),
    });

    // Log the status and headers for debugging
    console.log("AIML API Status:", response.status);
    console.log(
      "AIML API Headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API Error Response:", errorText);
      throw new Error(`AIML API returned ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as AIMLResponse;

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from AIML API");
    }

    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("AIML API error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
