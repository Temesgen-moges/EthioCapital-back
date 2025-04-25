import mongoose from "mongoose";

const BoardConversationSchema = new mongoose.Schema(
  {
    businessIdea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessIdea",
      required: true,
      index: true, // Index for faster lookups by business idea
    },
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (val) => val.length >= 2, // Minimum 2 participants
        message: "A board conversation must have at least two participants.",
      },
      index: true, // Index for querying by participants
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardMessage",
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Unique index to prevent duplicate conversations for the same business idea
BoardConversationSchema.index({ businessIdea: 1 }, { unique: true });

const BoardConversation = mongoose.model("BoardConversation", BoardConversationSchema);

export default BoardConversation;