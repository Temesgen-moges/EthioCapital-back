import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessIdea",
      required: true,
    }, // Link to the idea
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: [
        arrayLimit,
        "A conversation must have exactly two participants.",
      ],
    },
    lastMessage: {
      text: String,
      timestamp: Date,
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 2;
}

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
