import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, {
  timestamps: true,
});

const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

export default Room;
