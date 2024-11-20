// app/api/test/route.ts
import { NextResponse } from "next/server";

const AIML_API_ENDPOINT = "https://api.aimlapi.com/chat/completions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, maxTokens } = body;

    // Validate AIML API key
    if (!process.env.AIML_API_KEY) {
      console.error("AIML API key is missing");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // Call AIML API
    const aimlResponse = await fetch(AIML_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AIML_API_KEY}`,
      },
      body: JSON.stringify({
        model: "chatgpt-4o-latest",
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 1,
        stream: false,
      }),
    });

    if (!aimlResponse.ok) {
      throw new Error(`AIML API error: ${aimlResponse.status}`);
    }

    const data = await aimlResponse.json();

    return NextResponse.json({
      success: true,
      response: data.choices[0]?.message?.content || "No content received",
      model: data.model,
      usage: data.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
