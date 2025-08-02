import express from "express";
const router = express.Router();

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Room from "../models/Room.js";
import {authenticateUser} from "../middleware/authMiddleware.js";


// @desc Get rooms the user is part of
// @route GET /api/rooms
router.get("/",authenticateUser,async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const rooms = await Room.find({ members: user._id });
    res.status(200).json({ rooms });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: err.message });
  }
});

// @desc Join or create a room
// @route POST /api/rooms
router.post("/",authenticateUser,async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ error: "Room ID is required" });

    let room = await Room.findOne({ roomId });
    if (!room) {
      room = await Room.create({ roomId, members: [req.user.id] });
    } else if (!room.members.includes(req.user.id)) {
      room.members.push(req.user.id);
      await room.save();
    }

    const user = await User.findById(req.user.id);
    res.status(201).json({ message: "Room joined/created", username: user.username, room });
  } catch (err) {
    console.error("Error creating/joining room:", err);
    res.status(500).json({ error: err.message });
  }
});

// @desc Leave a room
// @route DELETE /api/rooms
router.delete("/", authenticateUser,async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ error: "Room ID is required" });

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });

    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      { $pull: { members: req.user.id } },
      { new: true }
    );

    res.status(200).json({ message: "Left room successfully", updatedRoom });
  } catch (err) {
    console.error("Error leaving room:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;