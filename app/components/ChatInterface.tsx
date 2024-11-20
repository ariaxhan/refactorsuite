"use client";

import React, { useState } from "react";

interface ChatInterfaceProps {
  conversation: { user: string; ai: string }[];
  onSend: (message: string, aiModel: "ChatGPT" | "Claude") => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversation }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAI, setSelectedAI] = useState<"ChatGPT" | "Claude">("ChatGPT");

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation,
          message,
          model: selectedAI,
        }),
      });

      if (!response.ok) throw new Error(`Chat error: ${response.statusText}`);

      const data = await response.json();
      onSend(message, selectedAI);
      setMessage("");
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded-md space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setSelectedAI("ChatGPT")}
          className={`px-4 py-2 rounded ${selectedAI === "ChatGPT" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        >
          ChatGPT
        </button>
        <button
          onClick={() => setSelectedAI("Claude")}
          className={`px-4 py-2 rounded ${selectedAI === "Claude" ? "bg-blue-500 text-white" : "bg-gray-100"}`}
        >
          Claude
        </button>
      </div>

      <div className="space-y-4">
        {conversation.map((c, i) => (
          <div key={i} className="space-y-2">
            <p>
              <strong>User:</strong> {c.user}
            </p>
            <p>
              <strong>{selectedAI}:</strong> {c.ai}
            </p>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          className="border p-2 flex-grow rounded"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
export default ChatInterface;
