"use client";
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import MetadataForm from "./components/MetadataForm";
import PlanReview from "./components/PlanReview";
import QuestionForm from "./components/QuestionForm";
import CodeReview from "./components/CodeReview";
import ChatInterface from "./components/ChatInterface";
import GeneratePlan from "./components/GeneratePlan";
import DisplayCode from "./components/DisplayCode";
import { ProjectMetadata } from "./types";

interface Question {
  id: string;
  question: string;
}

export default function Home() {
  // File state
  const [files, setFiles] = useState<
    { name: string; type: string; content: string }[]
  >([]);

  // Project analysis states
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Chat state
  const [conversation, setConversation] = useState<
    { user: string; ai: string }[]
  >([]);

  // Test route state
  const [testResponse, setTestResponse] = useState<string>("");

  const handleFileUpload = (
    uploadedFiles: { name: string; type: string; content: string }[],
  ) => {
    console.log("Uploaded files:", uploadedFiles);
    setFiles(uploadedFiles);
    // Reset dependent states when new files are uploaded
    setMetadata(null);
    setPlan(null);
    setQuestions([]);
    setAnswers({});
    setGeneratedCode(null);
    setError(null);
  };

  const handleMetadataSubmit = (data: ProjectMetadata) => {
    console.log("Metadata updated:", data);
    setMetadata(data);
    // Reset dependent states when metadata is updated
    setPlan(null);
    setQuestions([]);
    setAnswers({});
    setGeneratedCode(null);
  };

  const handlePlanGenerated = (generatedPlan: string) => {
    console.log("New plan generated");
    setPlan(generatedPlan);
    // Reset dependent states when plan is updated
    setQuestions([]);
    setAnswers({});
    setGeneratedCode(null);
  };

  const handleAnswersSaved = (newAnswers: Record<string, string>) => {
    console.log("New answers saved:", newAnswers);
    setAnswers(newAnswers);
    setGeneratedCode(null);
  };

  const handleCodeGenerated = async () => {
    if (!files || !metadata || !plan || !questions.length) {
      setError("Missing required data for code generation");
      return;
    }

    setIsGeneratingCode(true);
    setError(null);

    try {
      const response = await fetch("/api/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          metadata,
          plan,
          questions,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.code) {
        setGeneratedCode(result.code);
        console.log("Code generated successfully");
      } else {
        throw new Error(result.error || "Failed to generate code");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error generating code";
      console.error("Code generation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleChatMessage = async (
    message: string,
    aiModel: "ChatGPT" | "Claude",
  ) => {
    const newConversation = [...conversation, { user: message, ai: "" }];
    setConversation(newConversation);
    // TODO: Implement AI response handling
  };

  const callTestRoute = async () => {
    setLoading(true);
    setError(null);
    setTestResponse("");

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Write me some test code." },
    ];
    const maxTokens = 100;

    try {
      const res = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, maxTokens }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setTestResponse(data.response || "No response received.");
    } catch (err: any) {
      console.error("Test route error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <FileUpload onUpload={handleFileUpload} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <MetadataForm files={files} onSubmit={handleMetadataSubmit} />

      {metadata && (
        <GeneratePlan
          files={files}
          metadata={metadata}
          onPlanGenerated={handlePlanGenerated}
        />
      )}

      {plan && <PlanReview plan={plan} onQuestions={setQuestions} />}

      {questions.length > 0 && (
        <QuestionForm
          questions={questions}
          files={files}
          metadata={metadata!}
          plan={plan!}
          onQuestionsSaved={handleAnswersSaved}
        />
      )}

      {plan && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleCodeGenerated}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                     disabled:bg-blue-300 transition-colors"
            disabled={isGeneratingCode}
          >
            {isGeneratingCode ? "Generating..." : "Generate Code"}
          </button>
          {isGeneratingCode && (
            <span className="text-gray-500">
              This may take a few moments...
            </span>
          )}
        </div>
      )}

      {generatedCode && metadata && (
        <DisplayCode code={generatedCode} language={metadata.language} />
      )}

      {generatedCode && <CodeReview code={generatedCode} />}

      <ChatInterface conversation={conversation} onSend={handleChatMessage} />
    </div>
  );
}
