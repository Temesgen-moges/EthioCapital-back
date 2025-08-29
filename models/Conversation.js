import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessIdea",
      required: true,
      index: true, // Add index for faster lookups by idea
    },
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
      validate: {
        validator: (val) => val.length >= 2, // Minimum 2 participants, allows group chats
        message: "A conversation must have at least two participants.",
      },
      index: true, // Index for querying by participants
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Reference the Message model instead of duplicating data
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound index for queries filtering by idea and participants
ConversationSchema.index({ idea: 1, participants: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;