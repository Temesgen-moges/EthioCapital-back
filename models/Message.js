import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true, // Index for quick lookup by conversation
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for filtering by sender
    },
    text: {
      type: String,
      required: true,
      trim: true, // Remove leading/trailing whitespace
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by time
    },
    status: {
      type: String,
      enum: ["pending", "delivered", "read"], // Fixed syntax
      default: "pending", // Default status for real-time updates
    },
    isNew: {
      type: Boolean,
      default: true, // Kept for unread tracking, but optional
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true, // createdAt, updatedAt for auditing
  }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;