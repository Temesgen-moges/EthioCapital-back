import mongoose from "mongoose";

const documentAccessRequestSchema = new mongoose.Schema({
  ideaId: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessIdea", required: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  entrepreneurId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  ideaTitle: { type: String },
  requesterName: { type: String },
});

export default mongoose.model("DocumentAccessRequest", documentAccessRequestSchema);