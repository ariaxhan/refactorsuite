import { NextResponse } from "next/server";
import { callGroqJson } from "../utils/groqjson";

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const schema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              question: { type: "string" },
            },
          },
          minItems: 5,
          maxItems: 5,
        },
      },
    };

    const messages = [
      {
        role: "system",
        content: `Generate 5 key follow-up questions for this refactoring plan: ${plan}`,
      },
    ];

    const completion = await callGroqJson(messages, 500, schema);
    return NextResponse.json(completion);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
