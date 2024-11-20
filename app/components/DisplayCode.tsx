// components/DisplayCode.tsx
import { getHighlighter } from "shiki";
import React, { useEffect, useState } from "react";

interface DisplayCodeProps {
  code: string;
  language?: string;
}

interface CodeBlock {
  code: string;
  language: string;
}

export default function DisplayCode({
  code,
  language = "typescript",
}: DisplayCodeProps) {
  const [highlightedBlocks, setHighlightedBlocks] = useState<string[]>([]);

  const parseCodeBlocks = (rawCode: string): CodeBlock[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)\n```/g;
    const blocks: CodeBlock[] = [];
    let match;

    // If no code blocks are found, treat the entire code as one block
    if (!rawCode.includes("```")) {
      return [
        {
          code: rawCode,
          language: language.toLowerCase(),
        },
      ];
    }

    // Extract all code blocks
    while ((match = codeBlockRegex.exec(rawCode)) !== null) {
      blocks.push({
        language: (match[1] || language).toLowerCase(),
        code: match[2].trim(),
      });
    }

    return blocks;
  };

  useEffect(() => {
    async function highlightCode() {
      try {
        const highlighter = await getHighlighter({
          theme: "github-dark",
        });
        const supportedLanguages = highlighter.getLoadedLanguages();

        const codeBlocks = parseCodeBlocks(code);
        const highlightedCode = await Promise.all(
          codeBlocks.map(async (block) => {
            const lang = supportedLanguages.includes(block.language as any)
              ? block.language
              : "plaintext";

            // Pass the theme to codeToHtml
            return highlighter.codeToHtml(block.code, {
              lang,
              theme: "github-dark",
            });
          }),
        );

        setHighlightedBlocks(highlightedCode);
      } catch (error) {
        console.error("Error highlighting code:", error);
        setHighlightedBlocks(["<pre>Error loading code highlighter</pre>"]);
      }
    }
    highlightCode();
  }, [code, language]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Generated Code</h2>
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
          {language.toUpperCase()}
        </span>
      </div>
      <div className="space-y-4">
        {highlightedBlocks.map((block, index) => (
          <div
            key={index}
            className="overflow-x-auto rounded-md bg-gray-900 text-white p-4"
            dangerouslySetInnerHTML={{ __html: block }}
          />
        ))}
      </div>
    </div>
  );
}
