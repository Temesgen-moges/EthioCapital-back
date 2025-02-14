import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: { enum: ["delivered", "read", "pending"] } },
  isNew: { type: Boolean, default: true },
  // Optional: status fields (delivered, read) can be added
});

const Message= mongoose.model("Message",MessageSchema);

export default Message;