import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]">
          CodeCollab
        </h1>
        <div>
          <button
            className="mx-2 text-sm text-gray-300 hover:text-white"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
          <button
            className="mx-2 text-sm text-gray-300 hover:text-white"
            onClick={() => navigate("/login")}
          >
            Log In
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center h-[90vh] relative px-4">
        <div className="bg-gray-800 p-10 rounded-2xl shadow-lg z-10 flex flex-col items-center w-full max-w-md">
          <h2 className="text-3xl font-bold mb-12 text-white">Try CodeCollab</h2>

          <input
            type="text"
            placeholder="Enter your username"
            className="w-full p-3 mb-4 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Room ID"
            className="w-full p-3 mb-4 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button
            onClick={() => navigate(`/room/${roomId}?username=${username}`)}
            disabled={!username || !roomId}
            className={`w-full p-3 mb-3 rounded ${
              username && roomId
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 cursor-not-allowed"
            } text-white`}
          >
            Join Room
          </button>

          <button
            onClick={() => navigate(`/room/${uuidv4()}?username=${username}`)}
            disabled={!username}
            className={`w-full p-3 rounded ${
              username
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 cursor-not-allowed"
            } text-white`}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
