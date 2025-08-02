import { useState, useEffect, useRef } from "react";
import socket from "../utils/socket"; // centralized socket instance

export default function ChatRoom({ roomId, username }) {
  socket.emit("register-user", { username });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const hasJoinedRef = useRef(false); // ✅ Ensures join message sent only once

  // Function to be reused for manual leave
  const sendLeaveMessage = () => {
    socket.emit("leave", { roomId, username }); // 🔄 Use proper leave event
  };

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    if (!hasJoinedRef.current) {
      socket.emit("sendMessage", {
        roomId,
        message: `${username} has joined the room.`,
        username: "System",
      });
      hasJoinedRef.current = true;
    }

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    // ✅ Send beacon to backend on tab close/crash
    const handleUnload = () => {
      if (navigator.sendBeacon) {
        const url = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/leave`;
        const data = new Blob([
          JSON.stringify({ roomId, username }),
        ], { type: 'application/json' });
        navigator.sendBeacon(url, data);
      } else {
        sendLeaveMessage();
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      socket.off("receiveMessage");
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [roomId, username]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { roomId, message, username });
      setMessage("");
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="h-64 overflow-y-auto bg-gray-100 p-2 rounded-lg mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="text-sm mb-2 text-black">
            <strong>{msg.username || "Unknown"}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <textarea
  rows={2}
  className="flex-grow p-2 border rounded-lg text-black resize-none"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="Type a message"
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }}
/>

        <button
          className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>

      {/* Example Leave Room Button (future logic) */}
      {/*
      <button
        className="mt-2 p-2 bg-red-600 text-white rounded-lg"
        onClick={() => {
          sendLeaveMessage();
          navigate("/dashboard");
        }}
      >
        Leave Room
      </button>
      */}
    </div>
  );
}
