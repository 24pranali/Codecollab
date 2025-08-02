import { useState } from "react";
import { useNavigate } from "react-router-dom";

const url=process.env.REACT_APP_API_URL;
export default function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to join a room.");
        navigate("/login");
        return;
      }

      const res = await fetch(`${url}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join room");

      const username = data.username;
      navigate(`/room/${roomId}?username=${username}`);
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Join Room</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="p-2 border border-gray-400 rounded text-white mb-2 bg-gray-800"
      />
      <button
        onClick={handleJoinRoom}
        disabled={loading}
        className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700"
      >
        {loading ? "Joining..." : "Join Room"}
      </button>
    </div>
  );
}
