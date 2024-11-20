// app/api/generate-plan/route.ts
import { NextResponse } from "next/server";
import { callGroq } from "../utils/groq";

interface CodeFile {
  name: string;
  type: string;
  content: string;
}

interface CodeStyle {
  naming: string;
  comments: string;
  formatting: string;
}

interface ProjectMetadata {
  language: string;
  architecture: string;
  dependencies: string[];
  version?: string;
  targetPlatforms: string[];
  codeStyle: CodeStyle;
}

interface RequestBody {
  files: CodeFile[];
  metadata: ProjectMetadata;
  goal: string;
}

export async function POST(req: Request) {
  console.log(`[${new Date().toISOString()}] Received plan generation request`);

  try {
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { files, metadata, goal } = body;

    // Validate required fields
    if (!files || !metadata || !goal) {
      const missingFields = [];
      if (!files) missingFields.push("files");
      if (!metadata) missingFields.push("metadata");
      if (!goal) missingFields.push("goal");

      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      );
    }

    // Validate files array
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Files must be a non-empty array" },
        { status: 400 },
      );
    }

    // Generate AI prompt
    const messages = [
      {
        role: "system",
        content: `You are an expert software engineer analyzing code for refactoring.
Language: ${metadata.language}
Architecture: ${metadata.architecture}
Dependencies: ${metadata.dependencies.join(", ")}
User's Goal: ${goal}

Generate a clear, step-by-step refactoring plan that will help achieve this goal.
Focus on code organization, best practices, and potential improvements.`,
      },
      {
        role: "user",
        content: `Here is the codebase to analyze: ${JSON.stringify(files, null, 2)}`,
      },
    ];

    // Call Groq API with timeout
    const timeoutMs = 30000;
    const completionPromise = callGroq(messages, 1500);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
    });

    const completion = await Promise.race([completionPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      plan: completion,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating plan:", error);

    if (error.message.includes("timed out")) {
      return NextResponse.json(
        { error: "Request timed out. Please try again." },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate plan" },
      { status: 500 },
    );
  }
}
