"use client";
import React, { useState } from "react";
import { Question } from "../types";
import { Pencil, Check, X } from "lucide-react";

interface PlanReviewProps {
  plan: string;
  onQuestions: (questions: Question[]) => void;
}

const PlanReview: React.FC<PlanReviewProps> = ({ plan, onQuestions }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState(plan);
  const [originalPlan] = useState(plan); // Keep original plan for cancel

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ask-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: editedPlan }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.questions?.length) {
        throw new Error("No questions were generated");
      }

      onQuestions(data.questions);
    } catch (error) {
      console.error("Error generating questions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate questions",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Saving changes
      setIsEditing(false);
    } else {
      // Starting to edit
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setEditedPlan(originalPlan);
    setIsEditing(false);
  };

  return (
    <div className="border p-4 rounded-md space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Refactoring Plan</h2>
        {!isEditing ? (
          <button
            onClick={handleEditToggle}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
          >
            <Pencil size={16} />
            Edit Plan
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleEditToggle}
              className="flex items-center gap-1 text-green-500 hover:text-green-600 px-3 py-1 rounded-md hover:bg-green-50"
            >
              <Check size={16} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-600 px-3 py-1 rounded-md hover:bg-gray-50"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <textarea
          value={editedPlan}
          onChange={(e) => setEditedPlan(e.target.value)}
          className="w-full h-64 p-4 bg-gray-50 rounded-md border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm resize-vertical"
          placeholder="Enter your refactoring plan..."
        />
      ) : (
        <pre className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
          {editedPlan}
        </pre>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
          <X size={16} />
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 transition-colors flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⋮</span>
              Generating Questions...
            </>
          ) : (
            <>
              <Check size={16} />
              Approve Plan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PlanReview;
