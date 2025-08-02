import Code from "../models/Code.js";

export const fetchFilesByRoom = async (req, res) => {
  try {
    const { roomId } = req.query;
    const files = await Code.find({ roomId });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
};
