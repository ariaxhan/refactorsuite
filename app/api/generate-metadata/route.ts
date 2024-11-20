import { NextResponse } from "next/server";
import { callGroqJson } from "../utils/groqjson";

const metadataSchema = {
  type: "object",
  properties: {
    language: { type: "string" },
    architecture: { type: "string" },
    dependencies: { type: "array", items: { type: "string" } },
    version: { type: "string" },
    targetPlatforms: { type: "array", items: { type: "string" } },
    codeStyle: {
      type: "object",
      properties: {
        naming: { type: "string" },
        comments: { type: "string" },
        formatting: { type: "string" },
      },
      required: ["naming", "comments", "formatting"],
    },
  },
  required: ["language", "architecture", "dependencies", "targetPlatforms"],
};

export async function POST(req: Request) {
  try {
    // Parse the JSON request body
    const { files } = await req.json();

    // Validate the `files` input
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "The 'files' field must be a non-empty array." },
        { status: 400 },
      );
    }

    // Ensure each file has `name` and `content` properties
    files.forEach((file: any) => {
      if (typeof file.name !== "string" || typeof file.content !== "string") {
        throw new Error(
          "Each file must have 'name' (string) and 'content' (string) fields.",
        );
      }
    });

    // Truncate file content to prevent excessive data processing
    const truncatedFiles = files.map((file) => ({
      ...file,
      content: file.content.slice(0, 5000), // Limit content size to 5000 characters
    }));

    // Prepare the system prompt for metadata extraction
    const systemPrompt = `
      You are analyzing a codebase to extract structured metadata.
      Ensure the output adheres to the following schema: ${JSON.stringify(
        metadataSchema,
      )}
      Include details about:
      - Programming language
      - Architecture
      - Dependencies
      - Platforms
      - Performance considerations
      - Technical debt
      - Testing
      - Code style guidelines
    `;

    // Messages for the metadata generation process
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Codebase: ${JSON.stringify(truncatedFiles)}` },
    ];

    // Call the `callGroqJson` utility with messages and schema validation
    const metadata = await callGroqJson(messages, 2000, metadataSchema);

    // Return the extracted metadata as the response
    return NextResponse.json({ metadata });
  } catch (error: any) {
    console.error("Metadata generation error:", error.message, error.stack);

    // Respond with error details in case of failure
    return NextResponse.json(
      { error: `Failed to generate metadata: ${error.message}` },
      { status: 500 },
    );
  }
}
