import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdRooms: [{ type: String }], // Rooms the user has created
  joinedRooms: [{ type: String }],  // Rooms the user has joined
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
