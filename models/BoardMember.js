import mongoose from "mongoose";

const boardMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusinessIdea",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  shares: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
  image: {
    type: String, // Can store an image URL or emoji
    required: false,
  },
  bio: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  accountDetails: {
    type: String,
    required: false, // Only required for some members
  },
  bankName: {
    type: String,
    required: false, // Only required for some members
  },
  isBoardMember: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BoardMember = mongoose.model("BoardMember", boardMemberSchema);
export default BoardMember;
