// components/GeneratePlan.tsx
"use client";
import { useState } from "react";

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

interface PlanResponse {
  success?: boolean;
  plan?: string;
  error?: string;
  timestamp?: string;
}

interface GeneratePlanProps {
  files: CodeFile[];
  metadata: ProjectMetadata;
  onPlanGenerated: (plan: string) => void;
}

const GeneratePlan: React.FC<GeneratePlanProps> = ({
  files,
  metadata,
  onPlanGenerated,
}) => {
  const [goal, setGoal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const trimmedGoal = goal.trim();
    if (!trimmedGoal) {
      setError("Please enter a goal");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files,
          metadata,
          goal: trimmedGoal,
        }),
      });

      const data = (await response.json()) as PlanResponse;

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (!data.plan) {
        throw new Error("No plan was generated");
      }

      onPlanGenerated(data.plan);
    } catch (err) {
      console.error("Plan generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">
        What&apos;s your plan for this code?
      </h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="goal-input"
          className="block text-sm font-medium text-gray-700"
        >
          Refactoring Goal
        </label>
        <textarea
          id="goal-input"
          placeholder="Describe your goal (e.g., optimize performance, add new features, refactor architecture)"
          value={goal}
          onChange={(e) => {
            setError(null);
            setGoal(e.target.value);
          }}
          className="w-full h-32 p-3 border rounded-md resize-none
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-50 disabled:text-gray-500"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!goal.trim() || loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md
                 hover:bg-blue-600 disabled:bg-gray-400
                 disabled:cursor-not-allowed transition-colors
                 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin">⋮</span>
            Generating Plan...
          </>
        ) : (
          "Generate Plan"
        )}
      </button>
    </div>
  );
};

export default GeneratePlan;
