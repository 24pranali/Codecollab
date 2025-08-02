import mongoose from "mongoose";

const CodeSnippetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: String, required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
}, {
  timestamps: true,
});

// Check if model already exists before defining it
const CodeSnippet = mongoose.models.CodeSnippet || mongoose.model("CodeSnippet", CodeSnippetSchema);

export default CodeSnippet;
