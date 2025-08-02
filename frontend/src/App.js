import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import Dashboard from "./pages/DashBoard";
import Login from "./pages/Login";
import JoinRoom from "./pages/JoinRoom";
import RoomPage from "./pages/RoomPage";
import Signup from "./pages/Signup";
import "./index.css"; 
// TODO: Import Login, Signup, Room, etc. as you migrate them

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/room/:roomID" element={<RoomPage />} />
        <Route path="/signup" element={<Signup />} />
        {/* Add other routes below as you migrate them */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/room/:roomId" element={<Room />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
