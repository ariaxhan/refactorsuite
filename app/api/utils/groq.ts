import Groq, { ChatCompletionMessageParam } from "groq-sdk";

const groq = new Groq();

export async function callGroq(
  messages: ChatCompletionMessageParam[],
  maxTokens: number,
) {
  // Ensure the Groq API key is set in environment variables
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in environment variables");
  }

  try {
    // Call the Groq API to generate chat completions
    const response = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-70b-versatile", // Default model, can be updated as needed
      max_tokens: maxTokens,
      temperature: 0.1,
      top_p: 1, // Default top_p for deterministic output
      stop: null, // Optional: stop sequences can be defined
      stream: false, // Non-streaming for simplicity
    });

    // Extract and return the assistant's response
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}
