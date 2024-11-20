"use client";
import React, { useState } from "react";
import { ProjectMetadata } from "../types";

interface Question {
  id: string;
  question: string;
}

interface QuestionFormProps {
  questions: Question[];
  files: { name: string; type: string; content: string }[]; // Adjusted files type
  metadata: ProjectMetadata;
  plan: string;
}

export default function QuestionForm({ questions }: QuestionFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Answers submitted:", answers); // Log answers for debugging or processing
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Follow-up Questions</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions?.map((q) => (
          <div key={q.id} className="space-y-2">
            <label className="block font-medium text-gray-700">
              {q.question}
            </label>
            <textarea
              className="w-full p-2 border rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500"
              value={answers[q.id] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              placeholder="Enter your answer..."
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Save Answers
        </button>
      </form>
    </div>
  );
}
