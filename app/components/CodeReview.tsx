"use client";

import React from "react";

interface CodeReviewProps {
  code: string;
}

const CodeReview: React.FC<CodeReviewProps> = ({ code }) => {
  return (
    <div className="border p-4 rounded-md">
      <h2 className="text-lg font-semibold">Generated Code</h2>
      <pre className="bg-gray-100 p-4 rounded-md">{code}</pre>
    </div>
  );
};

export default CodeReview;
