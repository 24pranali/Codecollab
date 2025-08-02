import express from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import { initSocket, getIO} from "./socket/index.js";
import connectToDatabase from "./lib/mongo.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import saveCodeRoutes from "./routes/saveCodeRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: ["http://localhost:3000",
"https://codecolla.netlify.app"
  ],
  methods: ["GET", "POST","PUT","DELETE"],
  credentials: true
}));


app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("✅ API is working");
});

// Connect to DB
connectToDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/fetchFile", fileRoutes);
app.use("/api/saveCode", saveCodeRoutes);
app.use("/api/rooms", roomRoutes);

// Sockets
initSocket(server);

app.post("/leave", express.json(), (req, res) => {
  const { roomId, username } = req.body;

  if (roomId && username) {
    const io = getIO(); // 🔥 Properly get the io instance

    io.to(roomId).emit("receiveMessage", {
      username: "System",
      message: `${username} has left the room.`,
    });
  }

  res.status(200).send("Beacon handled");
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
