import { ElementAPI } from "@avaya/infinity-elements-api";
import React, { useEffect, useRef, useState } from "react";

interface Message {
  from: string;
  text: string;
  timestamp: number;
}

const Element: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [elementId] = useState(
    `Element-${Math.random().toString(36).slice(2, 7)}`
  );
  const apiRef = useRef<ElementAPI | null>(null);

  useEffect(() => {
    // Initialize ElementAPI
    apiRef.current = new ElementAPI({
      elementId,
      debug: true,
    });

    // Subscribe to inter-element messages
    const unsubscribe = apiRef.current.onInterElementMessage<Message>(
      (message) => {
        // Add received message to state
        setMessages((prev) => [...prev, message]);
      }
    );

    // Cleanup
    return () => {
      unsubscribe();
      apiRef.current?.destroy();
    };
  }, [elementId]);

  const sendMessage = () => {
    if (!inputText.trim() || !apiRef.current) return;

    const message: Message = {
      from: elementId,
      text: inputText,
      timestamp: Date.now(),
    };

    // Send message to other components
    apiRef.current.sendInterElementMessage(message);

    // Clear input
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "600px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Inter-Element Communication Demo</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Element ID:{" "}
        <code
          style={{
            backgroundColor: "#e0e0e0",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {elementId}
        </code>
      </p>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "6px",
          padding: "15px",
          marginBottom: "15px",
          minHeight: "200px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            fontSize: "16px",
            borderBottom: "1px solid #eee",
            paddingBottom: "8px",
          }}
        >
          Messages ({messages.length})
        </h3>
        {messages.length === 0 ? (
          <p style={{ color: "#999", fontStyle: "italic" }}>
            No messages yet. Open multiple instances of this component to test
            inter-element communication.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                padding: "10px",
                marginBottom: "8px",
                backgroundColor:
                  msg.from === elementId ? "#e3f2fd" : "#f5f5f5",
                borderRadius: "4px",
                borderLeft: `3px solid ${
                  msg.from === elementId ? "#2196f3" : "#9e9e9e"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                }}
              >
                <strong>From:</strong> {msg.from}
                <span style={{ marginLeft: "10px" }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div>{msg.text}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: inputText.trim() ? "pointer" : "not-allowed",
            fontSize: "14px",
            opacity: inputText.trim() ? 1 : 0.5,
          }}
        >
          Send
        </button>
      </div>

      <button
        onClick={clearMessages}
        style={{
          padding: "8px 16px",
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          width: "100%",
        }}
      >
        Clear Messages
      </button>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffc107",
          borderRadius: "6px",
          fontSize: "13px",
        }}
      >
        <strong>💡 How to test:</strong>
        <ol style={{ marginBottom: 0, paddingLeft: "20px" }}>
          <li>Open this page in multiple browser tabs/windows</li>
          <li>Send messages from any tab</li>
          <li>Watch as all tabs receive the messages in real-time</li>
        </ol>
      </div>
    </div>
  );
};

export default Element;
