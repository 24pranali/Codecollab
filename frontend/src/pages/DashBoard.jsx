import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

const url=process.env.REACT_APP_API_URL;
export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${url}/api/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setRooms(data.rooms || []);
        } else {
          console.error("Failed to fetch rooms:", data.error);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleLeaveRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to leave this room?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${url}/api/rooms`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });

      const data = await response.json();

      if (response.ok) {
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.roomId !== roomId)
        );
      } else {
        alert("Error leaving room: " + data.error);
      }
    } catch (error) {
      console.error("Error leaving room", error);
    }
  };

  const handleJoinRoom = async (roomId) => {
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
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">Your Rooms</h1>

        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            {rooms.map((room) => (
              <div
                key={room.roomId}
                className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 cursor-pointer border border-gray-700 hover:border-blue-500 flex flex-col items-center"
              >
                <p className="text-lg font-semibold text-center pb-3">
                  Room ID: <span className="text-blue-400">{room.roomId}</span>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    className="bg-green-600 px-3 py-1 rounded text-white cursor-pointer hover:bg-green-700"
                    onClick={() => handleJoinRoom(room.roomId)}
                  >
                    Join Room
                  </button>
                  <button
                    onClick={() => handleLeaveRoom(room.roomId)}
                    className="bg-red-600 px-3 py-1 rounded text-white cursor-pointer hover:bg-red-700"
                  >
                    Leave Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-lg">No rooms found 😕</p>
        )}
      </div>
    </DashboardLayout>
  );
}
