// app/api/refactor/route.ts
import { NextResponse } from "next/server";

const AIML_API_ENDPOINT = "https://api.aimlapi.com/chat/completions";

export async function POST(request: Request) {
  try {
    const { files, metadata, plan, questions, answers } = await request.json();

    if (!files || !metadata || !plan) {
      return NextResponse.json(
        { error: "Missing required fields: files, metadata, or plan" },
        { status: 400 },
      );
    }

    // Validate AIML API key
    if (!process.env.AIML_API_KEY) {
      console.error("AIML API key is missing");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert software engineer specializing in code refactoring.
You will be implementing the following refactoring plan: ${plan}
The codebase is written in ${metadata.language} using ${metadata.architecture} architecture.
The dependencies are: ${metadata.dependencies}.
Additional context from questions and answers: ${JSON.stringify(answers)}
Generate the refactored code based on the plan and requirements. ONLY OUTPUT THE CODE, wrapping
each block in triple backticks (\\\`\\\`\\\`) for proper formatting.`,
      },
      {
        role: "user",
        content: `Original codebase: ${JSON.stringify(files)}`,
      },
    ];

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
        max_tokens: 3000,
        temperature: 0.1,
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
      code: data.choices[0]?.message?.content || "No content received",
      model: data.model,
      usage: data.usage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating code:", error);
    return NextResponse.json(
      { error: `Error generating code: ${error.message}` },
      { status: 500 },
    );
  }
}
