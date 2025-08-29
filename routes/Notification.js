import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
} from "../controllers/chat/Notification.js";

const router = express.Router();

// Create a notification
router.post("/", createNotification);

// Get notifications for a user
router.get("/:userId", getNotifications);

// Mark a notification as read
router.put("/:notificationId/read", markAsRead);

export default router;