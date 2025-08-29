import Notification from "../../models/Notification.js";
import User from "../../models/User.js";

// Initialize WebSocket event listener for saving notifications
const setupNotificationWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    // Join user to their own room based on userId
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their notification room`);
    });

    // Listen for "saveNotification" event
    socket.on("saveNotification", async ({ userId, message, type }) => {
      try {
        console.log("Notification received");
        
        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
          socket.emit("error", { message: "User not found" });
          return;
        }

        // Create and save notification
        const notification = new Notification({
          user: userId,
          message,
          type,
        });
        await notification.save();

        console.log("Notification saved");
        
        // Emit notification to the user's room
        io.to(userId).emit("notification", {
          _id: notification._id,
          user: notification.user,
          message: notification.message,
          type: notification.type,
          status: notification.status,
          createdAt: notification.createdAt,
        });

        console.log(`Notification saved and emitted for user ${userId}`);
      } catch (error) {
        socket.emit("error", {
          message: "Failed to save notification",
          error: error.message,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected:", socket.id);
    });
  });
};
// In Notification.js
const triggerNotification = async (io, { userId, message, type }) => {
  try {
    // Validate inputs
    if (!userId || !message || !type) {
      throw new Error("Missing required fields: userId, message, or type");
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Create and save notification
    const notification = new Notification({
      user: userId,
      message,
      type,
    });
    await notification.save();

    // Emit notification to the user's room
    io.to(userId).emit("notification", {
      _id: notification._id,
      user: notification.user,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      createdAt: notification.createdAt,
    });

    console.log(`Notification saved and emitted for user ${userId}`);
    return { message: "Notification triggered successfully" };
  } catch (error) {
    console.error("Error triggering notification:", error.message);
    throw new Error(`Failed to trigger notification: ${error.message}`);
  }
};

// Create a notification and send it via WebSocket (HTTP endpoint)
const createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create notification
    const notification = new Notification({
      user: userId,
      message,
      type,
    });
    await notification.save();

    // Emit notification to the user's room via WebSocket
    req.io.to(userId).emit("notification", {
      _id: notification._id,
      user: notification.user,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      createdAt: notification.createdAt,
    });

    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "fullName email");
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.status = "read";
    await notification.save();
    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export { createNotification, getNotifications, markAsRead, triggerNotification };