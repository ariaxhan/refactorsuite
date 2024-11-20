import { NextResponse } from "next/server";
import { callAnthropic } from "../utils/anthropic";

export async function POST(req: Request) {
  try {
    const { conversation, message } = await req.json();

    const systemPrompt = `
      You are an interactive assistant helping refine a user's refactoring plan and code.
      The ongoing conversation history is: ${JSON.stringify(conversation)}.
      Respond to the user's latest input and provide actionable advice or code updates.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const response = await callAnthropic(messages, 1000);

    return NextResponse.json({ reply: response.completion });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
