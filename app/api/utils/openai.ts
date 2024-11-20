import OpenAI from "openai";

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callChatGPT(
  messages: { role: string; content: string }[], // Input messages in OpenAI's API format
  maxTokens: number, // Maximum tokens for the response
): Promise<string> {
  try {
    // Call the OpenAI Chat Completions API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Specify the model (e.g., GPT-4)
      messages, // Input messages
      max_tokens: maxTokens, // Maximum token limit
      temperature: 0.5, // Default temperature for controlled randomness
      top_p: 1, // Default top_p for deterministic output
      stop: null, // Optional stop sequences
      stream: false, // Non-streaming for simplicity
    });

    // Return the assistant's response
    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
