// import Message from "../../models/Message.js";
// import Conversation from "../../models/Conversation.js";
// import mongoose from "mongoose";

// // Pass Socket.IO instance to the controller (e.g., via a higher-level module)
// export const messageController = (io) => {
//   // Fetch messages for a specific conversation
//   const fetchMessages = async (req, res) => {
//     try {
//       const { conversationId, ideaId } = req.params;
//       const userId = req.user?.userId; // Ensure auth middleware sets req.user

//       if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(ideaId)) {
//         return res.status(400).json({ message: "Invalid conversationId or ideaId" });
//       }

//       const conversation = await Conversation.findOne({
//         _id: conversationId,
//         idea: ideaId,
//       }).lean();

//       if (!conversation) {
//         return res.status(404).json({ message: "Conversation not found" });
//       }

//       if (!conversation.participants.map(id => id.toString()).includes(userId)) {
//         return res.status(403).json({ message: "Unauthorized access" });
//       }

//       const messages = await Message.find({ conversationId })
//         .sort({ timestamp: 1 }) // Oldest first for chat UI
//         .lean();

//       res.status(200).json(messages);
//     } catch (error) {
//       console.error("Error fetching messages:", error);
//       res.status(500).json({ message: "Error fetching messages" });
//     }
//   };

//   // Fetch or create a conversation
//   const conversationFetch = async (req, res) => {
//     try {
//       const { participants, ideaId } = req.body;

//       if (!participants || participants.length < 2 || !ideaId) {
//         return res.status(400).json({ message: "Participants (min 2) and ideaId are required" });
//       }

//       if (!participants.every(id => mongoose.Types.ObjectId.isValid(id)) || !mongoose.Types.ObjectId.isValid(ideaId)) {
//         return res.status(400).json({ message: "Invalid participant IDs or ideaId" });
//       }

//       let conversation = await Conversation.findOne({
//         idea: ideaId,
//         participants: { $all: participants, $size: participants.length }, // Exact match
//       });

//       if (conversation) {
//         return res.status(200).json(conversation);
//       }

//       // Create new conversation
//       conversation = new Conversation({ idea: ideaId, participants });
//       await conversation.save();

//       // Notify participants of new conversation (optional)
//       participants.forEach(participantId => {
//         io.to(participantId.toString()).emit("newConversation", conversation);
//       });

//       res.status(201).json(conversation);
//     } catch (error) {
//       console.error("Error processing conversation:", error);
//       res.status(500).json({ message: "Failed to start conversation" });
//     }
//   };

//   // Update message status (e.g., mark as read)
//   const updateIsNewMessage = async (req, res) => {
//     try {
//       const { id } = req.params;

//       if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(400).json({ message: "Invalid message ID" });
//       }

//       const message = await Message.findById(id);
//       if (!message) {
//         return res.status(404).json({ message: "Message not found" });
//       }

//       message.isNew = false;
//       message.status = "read"; // Update status to "read" as well
//       await message.save();

//       // Notify conversation participants of status update
//       io.to(message.conversationId.toString()).emit("messageUpdated", message);

//       res.status(200).json(message);
//     } catch (error) {
//       console.error("Error updating message:", error);
//       res.status(500).json({ message: "Error updating message" });
//     }
//   };

//   // Fetch all messages for a user (e.g., unread or all)
//   const fetchUserMessages = async (req, res) => {
//     try {
//       const { userId } = req.params;

//       if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({ message: "Invalid userId" });
//       }

//       const conversations = await Conversation.find({ participants: userId }).lean();
//       if (!conversations.length) {
//         return res.status(200).json([]);
//       }

//       const conversationIds = conversations.map(conv => conv._id);
//       const messages = await Message.find({
//         conversationId: { $in: conversationIds },
//         // isNew: true, // Uncomment if you only want unread messages
//       })
//         .populate({
//           path: "conversationId",
//           select: "idea participants lastMessage",
//         })
//         .sort({ timestamp: -1 }) // Newest first for this endpoint
//         .lean();

//       res.status(200).json(messages);
//     } catch (error) {
//       console.error("Error fetching user messages:", error);
//       res.status(500).json({ message: "Error fetching user messages" });
//     }
//   };

//   const getConversationsByIdea = async (req, res) => {
//     try {
//       const { ideaId } = req.params;
//       const conversations = await Conversation.find({ idea: ideaId })
//         .populate("participants", "fullName")
//         .populate("lastMessage");
//       res.status(200).json(conversations);
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching conversations", error });
//     }
//   };

//   // New function: Send a message and notify clients
//   const sendMessage = async (req, res) => {
//     console.log("sending message a new one");
    
//     try {
//       const { conversationId, text } = req.body;
//       const senderId = req.user?.userId;

//       if (!mongoose.Types.ObjectId.isValid(conversationId) || !text || !senderId) {
//         return res.status(400).json({ message: "conversationId, text, and sender are required" });
//       }

//       const conversation = await Conversation.findById(conversationId);
//       if (!conversation) {
//         return res.status(404).json({ message: "Conversation not found" });
//       }

//       if (!conversation.participants.map(id => id.toString()).includes(senderId)) {
//         return res.status(403).json({ message: "Unauthorized to send message" });
//       }

//       const message = new Message({
//         conversationId,
//         sender: senderId,
//         text,
//       });
//       await message.save();

//       // Update lastMessage in conversation
//       conversation.lastMessage = message._id;
//       await conversation.save();

//       // Notify all participants in the conversation
//       io.to(conversationId.toString()).emit("newMessage", message);

//       res.status(201).json(message);
//     } catch (error) {
//       console.error("Error sending message:", error);
//       res.status(500).json({ message: "Error sending message" });
//     }
//   };

//   return {
//     fetchMessages,
//     conversationFetch,
//     updateIsNewMessage,
//     fetchUserMessages,
//     sendMessage,
//     getConversationsByIdea
//   };
// };

// export default messageController;   

import Message from "../../models/Message.js";
import User from "../../models/User.js";
import Conversation from "../../models/Conversation.js";
import mongoose from "mongoose";
import { triggerNotification } from "./Notification.js";

// Pass Socket.IO instance to the controller (e.g., via a higher-level module)
export const messageController = (io) => {
  // Fetch messages for a specific conversation
  const fetchMessages = async (req, res) => {
    try {
      const { conversationId, ideaId } = req.params;
      const userId = req.user?.userId; // Ensure auth middleware sets req.user

      if (
        !mongoose.Types.ObjectId.isValid(conversationId) ||
        !mongoose.Types.ObjectId.isValid(ideaId)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid conversationId or ideaId" });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        idea: ideaId,
      }).lean();

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (
        !conversation.participants.map((id) => id.toString()).includes(userId)
      ) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const messages = await Message.find({ conversationId })
        .sort({ timestamp: 1 }) // Oldest first for chat UI
        .lean();

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  };

  // Fetch or create a conversation
  const conversationFetch = async (req, res) => {
    try {
      const { participants, ideaId } = req.body;

      if (!participants || participants.length < 2 || !ideaId) {
        return res
          .status(400)
          .json({ message: "Participants (min 2) and ideaId are required" });
      }

      if (
        !participants.every((id) => mongoose.Types.ObjectId.isValid(id)) ||
        !mongoose.Types.ObjectId.isValid(ideaId)
      ) {
        return res
          .status(400)
          .json({ message: "Invalid participant IDs or ideaId" });
      }

      let conversation = await Conversation.findOne({
        idea: ideaId,
        participants: { $all: participants, $size: participants.length }, // Exact match
      });

      if (conversation) {
        return res.status(200).json(conversation);
      }

      // Create new conversation
      conversation = new Conversation({ idea: ideaId, participants });
      await conversation.save();

      // Notify participants of new conversation (optional)
      participants.forEach((participantId) => {
        io.to(participantId.toString()).emit("newConversation", conversation);
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error processing conversation:", error);
      res.status(500).json({ message: "Failed to start conversation" });
    }
  };

  // Update message status (e.g., mark as read)
  const updateIsNewMessage = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await Message.findById(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      message.isNew = false;
      message.status = "read"; // Update status to "read" as well
      await message.save();

      // Notify conversation participants of status update
      io.to(message.conversationId.toString()).emit("messageUpdated", message);

      res.status(200).json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Error updating message" });
    }
  };

  // Fetch all messages for a user (e.g., unread or all)
  const fetchUserMessages = async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }

      const conversations = await Conversation.find({
        participants: userId,
      }).lean();
      if (!conversations.length) {
        return res.status(200).json([]);
      }

      const conversationIds = conversations.map((conv) => conv._id);
      const messages = await Message.find({
        conversationId: { $in: conversationIds },
        // isNew: true, // Uncomment if you only want unread messages
      })
        .populate({
          path: "conversationId",
          select: "idea participants lastMessage",
        })
        .sort({ timestamp: -1 }) // Newest first for this endpoint
        .lean();

      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching user messages:", error);
      res.status(500).json({ message: "Error fetching user messages" });
    }
  };

  const getConversationsByIdea = async (req, res) => {
    try {
      const { ideaId } = req.params;
      const conversations = await Conversation.find({ idea: ideaId })
        .populate("participants", "fullName")
        .populate("lastMessage");
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations", error });
    }
  };

  // New function: Send a message and notify clients
  const sendMessage = async (req, res) => {
    console.log("sending message a new one");

    try {
      const { conversationId, text } = req.body;
      const senderId = req?.user?.userId;

      console.log("After user id for message with participant : ", req?.user);

      if (
        !mongoose.Types.ObjectId.isValid(conversationId) ||
        !text ||
        !senderId
      ) {
        return res
          .status(400)
          .json({ message: "conversationId, text, and sender are required" });
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (
        !conversation.participants.map((id) => id.toString()).includes(senderId)
      ) {
        return res
          .status(403)
          .json({ message: "Unauthorized to send message" });
      }
      console.log(
        "user id for message with participant : ",
        conversation.participants
      );

      const message = new Message({
        conversationId,
        sender: senderId,
        text,
      });
      await message.save();

      // Update lastMessage in conversation
      conversation.lastMessage = message._id;
      await conversation.save();

      // Notify all participants in the conversation
      io.to(conversationId.toString()).emit("newMessage", message);

      // Convert senderId to ObjectId if it's a string
      const senderObjectId =
        typeof senderId === "string"
          ? new mongoose.Types.ObjectId(senderId)
          : senderId;

      // Filter out the sender from participants to get recipients
      const recipients = conversation.participants.filter(
        (participant) => !participant.equals(senderObjectId)
      );

      // Fetch sender's fullName for notification message
      const sender = await User.findById(senderObjectId);
      if (!sender) {
        throw new Error("Sender not found");
      }
      const senderName = sender.fullName || "User";

      // Trigger notification for each recipient
      if (req.io) {
        for (const recipient of recipients) {
          const recipientId = recipient.toString();
          await triggerNotification(req.io, {
            userId: recipientId,
            message: `New UnRead Message from ${senderName}`,
            type: "info",
          });
          console.log(`Notification triggered for recipient ${recipientId}`);
        }
      } else {
        console.error("Socket.IO instance is not available");
      }
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  };

  return {
    fetchMessages,
    conversationFetch,
    updateIsNewMessage,
    fetchUserMessages,
    sendMessage,
    getConversationsByIdea,
  };
};

export default messageController;
