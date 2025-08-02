import { io } from "socket.io-client";

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create and export a single socket instance
const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
