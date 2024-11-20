import Groq, { ChatCompletionMessageParam } from "groq-sdk";

const groq = new Groq();

export async function callGroqJson(
  messages: ChatCompletionMessageParam[],
  maxTokens: number,
  schema?: object,
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY in environment variables");
  }

  try {
    if (schema) {
      messages.unshift({
        role: "system",
        content: `You must output JSON following this schema: ${JSON.stringify(schema, null, 2)}`,
      });
    }

    const response = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
      max_tokens: maxTokens,
      temperature: 0,
      top_p: 1,
      stop: null,
      stream: false,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error(`Groq API error: ${error.message}`);
  }
}
