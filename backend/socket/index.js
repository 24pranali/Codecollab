// === Step 1: Modify your backend (socket/index.js) ===

import { Server } from "socket.io";

const videoRooms = {};
const rooms = {};
const userSocketMap = {}; // userId -> socket.id
const socketUsernameMap = {}; // socket.id -> username

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000",
        "https://codecolla.netlify.app"
      ],
      methods: ["GET", "POST","PUT","DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ Connected:", socket.id);

    // NEW: Save username from frontend
    socket.on("register-user", ({ username }) => {
      socketUsernameMap[socket.id] = username;
      console.log(`✅ Registered ${username} for ${socket.id}`);
    });

    socket.on("join-video", ({ roomId, userId }) => {
      userSocketMap[userId] = socket.id;
      socket.join(roomId);
      socket.to(roomId).emit("user-joined-video", { peerId: userId });
    });

    socket.on("video-offer", ({ target, caller, sdp }) => {
      const targetSocketId = userSocketMap[target];
      if (targetSocketId) io.to(targetSocketId).emit("video-offer", { caller, sdp });
    });

    socket.on("video-answer", ({ target, caller, sdp }) => {
      const targetSocketId = userSocketMap[target];
      if (targetSocketId) io.to(targetSocketId).emit("video-answer", { caller, sdp });
    });

    socket.on("ice-candidate", ({ target, from, candidate }) => {
      const targetSocketId = userSocketMap[target];
      if (targetSocketId) io.to(targetSocketId).emit("ice-candidate", { from, candidate });
    });

    socket.on("leave-video", ({ roomId, userId }) => {
      socket.leave(roomId);
      delete userSocketMap[userId];
      socket.to(roomId).emit("user-left-video", { peerId: userId });
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      if (!rooms[roomId]) rooms[roomId] = { files: [], messages: [] };
      socket.emit("filesUpdate", rooms[roomId].files);
    });

    socket.on("filesUpdate", ({ roomId, files }) => {
      if (!rooms[roomId]) rooms[roomId] = { files: [], messages: [] };
      rooms[roomId].files = files;
      io.to(roomId).emit("filesUpdate", files);
    });

    socket.on("codeChange", ({ roomId, fileName, code }) => {
      const fileList = rooms[roomId]?.files || [];
      const index = fileList.findIndex((f) => f.name === fileName);
      if (index !== -1) {
        fileList[index].content = code;
        socket.to(roomId).emit("codeChange", { fileName, code });
      }
    });

    socket.on("sendMessage", ({ roomId, message, username }) => {
      if (!rooms[roomId]) rooms[roomId] = { files: [], messages: [] };
      rooms[roomId].messages.push({ username, message });
      io.to(roomId).emit("receiveMessage", { username, message });
    });

    socket.on("disconnect", () => {
      const username = socketUsernameMap[socket.id];
      if (username) {
        delete socketUsernameMap[socket.id];
        console.log("❌ Disconnected:", socket.id, username);

        // Send leave message to all rooms
        const joinedRooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
        joinedRooms.forEach((roomId) => {
          io.to(roomId).emit("receiveMessage", {
            username: "System",
            message: `${username} has left the room.`,
          });
        });
      }
    });
  });
}

export function getIO() {
  return io;
}