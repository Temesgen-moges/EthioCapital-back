import express from "express";
import boardMessageController from "../controllers/Board/boardMessageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Initialize controller with Socket.IO instance
const { conversationFetch, fetchMessages, sendMessage, updateMessageStatus } = boardMessageController(
  (req) => req.app.get("io")
);

// Fetch or create a conversation
router.post("/conversation", authMiddleware, conversationFetch);

// Fetch messages for a conversation
router.get("/messages/:conversationId", authMiddleware, fetchMessages);

// Send a new message
router.post("/message", authMiddleware, sendMessage);

// Update message status (mark as read)
router.patch("/message/:id/status", authMiddleware, updateMessageStatus);

export default router;