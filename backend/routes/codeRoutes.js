const express = require("express");
const router = express.Router();
const Code = require("../models/Code");
const { authenticateUser } = require("../middleware/authMiddleware");

// @desc Get all files for a room
// @route GET /api/code?roomId=123
router.get("/", async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) return res.status(400).json({ error: "roomId is required" });

    const files = await Code.find({ roomId }).select("fileName language content -_id");
    res.status(200).json({ files });
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

module.exports = router;