import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  addReply,
  updateIsNew,
  deleteComplaint,
} from "../controllers/chat/Compliant.js"; // Assuming this exists

const createMessageRouter = ({
  fetchMessages,
  conversationFetch,
  updateIsNewMessage,
  fetchUserMessages,
  sendMessage,
  getConversationsByIdea
}) => {
  const messageRouter = express.Router();

  // Message Routes
  messageRouter.get("/messages/:conversationId/:ideaId", authenticate, fetchMessages);
  messageRouter.get("/user-messages/:userId", authenticate, fetchUserMessages);
  messageRouter.put("/message/:id", authenticate, updateIsNewMessage);
  messageRouter.post("/conversation", authenticate, conversationFetch);
  messageRouter.post("/send-message", authenticate, sendMessage);
  messageRouter.get("/conversations/idea/:ideaId", authenticate, getConversationsByIdea);

  // Complaint Routes (unchanged)
  messageRouter.post("/complaint", authenticate, createComplaint);
  messageRouter.get("/complaints", authenticate, getComplaints);
  messageRouter.get("/complaint/:id", authenticate, getComplaintById);
  messageRouter.post("/complaint/reply/:id", authenticate, addReply);
  messageRouter.patch("/complaint/is-new/:id", authenticate, updateIsNew);
  messageRouter.delete("/complaint/:id", authenticate, deleteComplaint);

  return messageRouter;
};

export default createMessageRouter; 