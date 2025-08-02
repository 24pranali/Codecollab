import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setUser(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4">CodeCollab</h2>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className="bg-gray-700 p-2 rounded">Dashboard</Link>
          <Link to="/create-room" className="bg-gray-700 p-2 rounded">Create Room</Link>
          <Link to="/join-room" className="bg-gray-700 p-2 rounded">Join Room</Link>
          <button onClick={handleLogout} className="bg-red-600 p-2 mt-4 rounded">Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
