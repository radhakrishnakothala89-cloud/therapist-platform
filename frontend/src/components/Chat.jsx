
import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";

export default function Chat({
  currentUserId,
  recipientId,
  recipientName,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("join", currentUserId);

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!input.trim() || !currentUserId || !recipientId) {
      return;
    }

    const messageData = {
      senderId: currentUserId,
      recipientId: recipientId,
      content: input.trim(),
    };

    socket.emit("sendMessage", messageData);

    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        _id: Date.now(),
      },
    ]);

    setInput("");
  };

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "0 auto",
        backgroundColor: "#d23da8",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "540px",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            backgroundColor: "#dd3aa6",
            color: "#4F46E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "700",
            fontSize: "14px",
          }}
        >
          {recipientName ? recipientName[0] : "C"}
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "700",
              color: "#1E293B",
            }}
          >
            {recipientName || "Client"}
          </h3>

          <span
            style={{
              fontSize: "12px",
              color: "#10B981",
              fontWeight: "500",
            }}
          >
            ● Active Now
          </span>
        </div>
      </div>

      {/* Message History */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          backgroundColor: "#1eb3d1",
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              marginTop: "auto",
              marginBottom: "auto",
              color: "#FFFFFF",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
              }}
            >
              No messages yet.
            </p>

            <small
              style={{
                fontSize: "12px",
              }}
            >
              Send a message to start the consultation.
            </small>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMe = m.senderId === currentUserId;

            return (
              <div
                key={m._id || i}
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                }}
              >
                <div
                  style={{
                    backgroundColor: isMe ? "#4F46E5" : "#FFFFFF",
                    color: isMe ? "#FFFFFF" : "#1E293B",
                    padding: "10px 16px",
                    borderRadius: isMe
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow:
                      "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "14px 18px",
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px 16px",
            border: "1px solid #CBD5E1",
            borderRadius: "10px",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#F8FAFC",
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#4F46E5",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            padding: "10px 20px",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow:
              "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
