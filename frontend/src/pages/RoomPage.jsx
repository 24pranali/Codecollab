import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import Editor from "../components/Editor";
import VideoChat from "../components/Video";
import ChatRoom from "../components/Chat";

export default function RoomPage() {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [socket, setSocket] = useState(null);
  const [userId] = useState(() => uuidv4());
  const [showVideo, setShowVideo] = useState(false);

  const username = searchParams.get("username");
  const BACKEND_URL=process.env.REACT_APP_API_URL;
 
  useEffect(() => {
  if (!roomID) return;

  const socketInstance = io(BACKEND_URL, {
    query: { roomID },
  });

  setSocket(socketInstance);

  socketInstance.on("connect", () => {
    socketInstance.emit("register-user", { username }); // ✅ Send username to backend
  });

  return () => {
    socketInstance.disconnect();
  };
}, [roomID, username]); // ✅ Add `username` as dependency


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  if (!socket) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Connecting...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 sm:gap-0">
  <h1 className="text-xl font-bold text-white">
    CodeCollab: Room {roomID}
  </h1>

  <div className="flex flex-col sm:flex-row items-center gap-2 text-white z-[1000]">
    <span>👤 {username}</span>

    {localStorage.getItem("token") ? (
      // ✅ Logged In
      <>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#4CAF50] text-white px-3 py-2 rounded"
        >
          Dashboard
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            navigate("/");
          }}
          className="bg-[#f44336] text-white px-3 py-2 rounded"
        >
          Logout
        </button>
      </>
    ) : (
      // ✅ Not Logged In
      <>
        <button
  onClick={() => {
    socket.emit("sendMessage", {
      roomId: roomID,
      message: `${username} has left the room.`,
      username: "System",
    });
    socket.disconnect(); // optional: force close socket
    navigate("/");
  }}
  className="bg-yellow-600 text-white px-3 py-2 rounded"
>
  Leave Room
</button>

        <button
          onClick={() => navigate("/login")}
          className="bg-[#2196F3] text-white px-3 py-2 rounded"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="bg-[#4CAF50] text-white px-3 py-2 rounded"
        >
          Signup
        </button>
      </>
    )}
  </div>
</header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Editor Section */}
        <div className="md:w-2/3 bg-gray-800 p-4">
          <div className="bg-gray-700 rounded p-4 h-screen">
            <Editor roomId={roomID} />
          </div>
        </div>

        {/* Chat + Video Section */}
        <div className="flex flex-col sm:w-1/3 bg-gray-800 p-4 space-y-3">
          <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-xl font-semibold mb-2">Live Group Chat</h3>
            <ChatRoom roomId={roomID} username={username} />
          </div>

          {!showVideo && (
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowVideo(true)}
                className="px-12 py-3 rounded bg-green-500"
              >
                Join Video
              </button>
            </div>
          )}

          {showVideo && socket && (
            <div className="bg-gray-800 rounded-lg shadow-md">
              <VideoChat
                roomId={roomID}
                socket={socket}
                userId={userId}
                setShowVideo={setShowVideo}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
