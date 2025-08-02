// backend/routes/saveCodeRoutes.js
import express from "express";
import mongoose from "mongoose";
import Code from "../models/Code.js";
import  connectToDatabase  from "../lib/mongo.js";

const router = express.Router();

// POST /api/save-code
router.post("/", async (req, res) => {
  try {
    await connectToDatabase();

    const { roomId, files } = req.body;
    if (!roomId || !Array.isArray(files)) {
      return res.status(400).json({ error: "roomId and files are required" });
    }

    for (const file of files) {
  const newCode = new Code({
    roomId,
    fileName: file.name,
    language: file.language,
    code: file.content, // ✅ Fix here
  });
  await newCode.save();
}

    console.log("✅ All files saved to MongoDB");
    return res.status(200).json({ message: "Files saved successfully!" });
  } catch (error) {
    console.error("❌ Error saving files:", error);
    return res.status(500).json({ error: "Failed to save files" });
  }
});

export default router;
