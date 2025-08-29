import mongoose from "mongoose";
import BoardConversation from "../../models/BoardConversation.js";
import BoardMessage from "../../models/BoardMessage.js";
import BoardMemberDatabase from "../../models/BoardMemberDatabase.js";

// Controller for board chat functionality, initialized with Socket.IO instance
export const boardMessageController = (io) => {
  // Fetch or create a conversation for a business idea
  const conversationFetch = async (req, res) => {
    try {
      const { businessIdeaId } = req.body;
      const userId = req.user?._id;

      console.log("[conversationFetch] Request received:", { businessIdeaId, userId });

      // Validate businessIdeaId
      if (!businessIdeaId) {
        console.warn("[conversationFetch] Missing businessIdeaId");
        return res.status(400).json({ success: false, message: "businessIdeaId is required" });
      }
      if (!mongoose.Types.ObjectId.isValid(businessIdeaId)) {
        console.warn("[conversationFetch] Invalid businessIdeaId format:", businessIdeaId);
        return res.status(400).json({ success: false, message: `Invalid businessIdeaId format: ${businessIdeaId}` });
      }

      // Fetch board members to determine participants
      const board = await BoardMemberDatabase.findOne({ businessIdea: businessIdeaId }).lean();
      if (!board) {
        console.warn("[conversationFetch] No board found for businessIdeaId:", businessIdeaId);
        return res.status(404).json({
          success: false,
          message: `No board found for businessIdeaId: ${businessIdeaId}`,
        });
      }

      // Check for valid entrepreneur and investors
      if (!board.entrepreneur?.userId || !board.investors?.length) {
        console.warn("[conversationFetch] Invalid board data:", {
          businessIdeaId,
          hasEntrepreneur: !!board.entrepreneur?.userId,
          investorCount: board.investors?.length || 0,
        });
        return res.status(400).json({
          success: false,
          message: `Board data incomplete: Missing entrepreneur or investors for businessIdeaId: ${businessIdeaId}`,
        });
      }

      // Verify user is a board member or entrepreneur
      const isBoardMember =
        board.entrepreneur.userId.toString() === userId.toString() ||
        board.investors.some((investor) => investor.userId?.toString() === userId.toString());
      if (!isBoardMember) {
        console.warn("[conversationFetch] Unauthorized user:", { userId, businessIdeaId });
        return res.status(403).json({
          success: false,
          message: `User ${userId} is not a board member for businessIdeaId: ${businessIdeaId}`,
        });
      }

      // Get participant IDs (entrepreneur + investors)
      const participants = [
        board.entrepreneur.userId,
        ...board.investors.map((investor) => investor.userId).filter((id) => id && mongoose.Types.ObjectId.isValid(id)),
      ];

      if (participants.length < 2) {
        console.warn("[conversationFetch] Insufficient participants:", { businessIdeaId, participants });
        return res.status(400).json({
          success: false,
          message: `A conversation requires at least two valid participants for businessIdeaId: ${businessIdeaId}`,
        });
      }

      // Find or create conversation
      let conversation = await BoardConversation.findOne({ businessIdea: businessIdeaId });
      if (!conversation) {
        console.log("[conversationFetch] Creating new conversation for businessIdeaId:", businessIdeaId);
        conversation = new BoardConversation({
          businessIdea: businessIdeaId,
          participants,
        });
        await conversation.save();

        // Notify participants of new conversation
        if (io) {
          participants.forEach((participantId) => {
            console.log("[conversationFetch] Emitting newBoardConversation to user:", participantId.toString());
            io.to(participantId.toString()).emit("newBoardConversation", {
              _id: conversation._id,
              businessIdea: conversation.businessIdea,
              participants: conversation.participants,
            });
          });
        } else {
          console.warn("[conversationFetch] Socket.IO not initialized");
        }
      } else {
        console.log("[conversationFetch] Found existing conversation:", conversation._id);
      }

      res.status(200).json({ success: true, data: conversation });
    } catch (error) {
      console.error("[conversationFetch] Error:", {
        message: error.message,
        stack: error.stack,
        businessIdeaId: req.body.businessIdeaId,
        userId: req.user?._id,
      });
      res.status(500).json({
        success: false,
        message: `Failed to fetch or create conversation: ${error.message}`,
      });
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?._id;

      console.log("[fetchMessages] Request received:", { conversationId, userId });

      // Validate conversationId
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        console.warn("[fetchMessages] Invalid conversationId format:", conversationId);
        return res.status(400).json({ success: false, message: `Invalid conversationId format: ${conversationId}` });
      }

      // Find conversation
      const conversation = await BoardConversation.findById(conversationId);
      if (!conversation) {
        console.warn("[fetchMessages] Conversation not found:", conversationId);
        return res.status(404).json({ success: false, message: `Conversation not found: ${conversationId}` });
      }

      // Verify user is a participant
      if (!conversation.participants.map((id) => id.toString()).includes(userId.toString())) {
        console.warn("[fetchMessages] Unauthorized user:", { userId, conversationId });
        return res.status(403).json({
          success: false,
          message: `User ${userId} is not a participant in conversation: ${conversationId}`,
        });
      }

      // Fetch messages
      const messages = await BoardMessage.find({ conversationId })
        .populate("sender", "fullName email")
        .sort({ timestamp: 1 })
        .lean();

      // Format messages for frontend
      const formattedMessages = messages.map((msg) => ({
        id: msg._id,
        conversationId: msg.conversationId,
        user: msg.sender?.fullName || msg.sender?.email || "Unknown User",
        text: msg.text,
        time: new Date(msg.timestamp).toLocaleTimeString(),
      }));

      console.log("[fetchMessages] Returning messages:", { count: formattedMessages.length, conversationId });
      res.status(200).json({ success: true, data: formattedMessages });
    } catch (error) {
      console.error("[fetchMessages] Error:", {
        message: error.message,
        stack: error.stack,
        conversationId: req.params.conversationId,
        userId,
      });
      res.status(500).json({ success: false, message: `Error fetching messages: ${error.message}` });
    }
  };

  // Send a new message
  const sendMessage = async (req, res) => {
    try {
      const { conversationId, text } = req.body;
      const senderId = req.user?._id;

      console.log("[sendMessage] Request received:", { conversationId, senderId, text: text?.substring(0, 50) });

      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        console.warn("[sendMessage] Invalid conversationId format:", conversationId);
        return res.status(400).json({ success: false, message: `Invalid conversationId format: ${conversationId}` });
      }
      if (!text?.trim()) {
        console.warn("[sendMessage] Missing or empty text");
        return res.status(400).json({ success: false, message: "Message text is required" });
      }

      // Find conversation
      const conversation = await BoardConversation.findById(conversationId);
      if (!conversation) {
        console.warn("[sendMessage] Conversation not found:", conversationId);
        return res.status(404).json({ success: false, message: `Conversation not found: ${conversationId}` });
      }

      // Verify sender is a participant
      if (!conversation.participants.map((id) => id.toString()).includes(senderId.toString())) {
        console.warn("[sendMessage] Unauthorized user:", { senderId, conversationId });
        return res.status(403).json({
          success: false,
          message: `User ${senderId} is not a participant in conversation: ${conversationId}`,
        });
      }

      // Create and save message
      const message = new BoardMessage({
        conversationId,
        sender: senderId,
        text: text.trim(),
        isNewMessage: true,
      });
      await message.save();

      // Update lastMessage in conversation
      conversation.lastMessage = message._id;
      await conversation.save();

      // Populate sender details
      const populatedMessage = await BoardMessage.findById(message._id)
        .populate("sender", "fullName email")
        .lean();

      // Format message for Socket.IO and response
      const formattedMessage = {
        id: populatedMessage._id,
        conversationId: populatedMessage.conversationId,
        user: populatedMessage.sender?.fullName || populatedMessage.sender?.email || "Unknown User",
        text: populatedMessage.text,
        time: new Date(populatedMessage.timestamp).toLocaleTimeString(),
      };

      // Emit Socket.IO event to conversation participants
      if (io) {
        console.log("[sendMessage] Emitting newBoardMessage to room:", `conversation:${conversationId}`);
        io.to(`conversation:${conversationId}`).emit("newBoardMessage", formattedMessage);
      } else {
        console.warn("[sendMessage] Socket.IO not initialized");
      }

      console.log("[sendMessage] Message sent:", { messageId: message._id, conversationId });
      res.status(201).json({ success: true, data: formattedMessage });
    } catch (error) {
      console.error("[sendMessage] Error:", {
        message: error.message,
        stack: error.stack,
        conversationId: req.body.conversationId,
        userId: senderId,
      });
      res.status(500).json({ success: false, message: `Error sending message: ${error.message}` });
    }
  };

  // Update message status (mark as read)
  const updateMessageStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      console.log("[updateMessageStatus] Request received:", { messageId: id, userId });

      // Validate message ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn("[updateMessageStatus] Invalid message ID format:", id);
        return res.status(400).json({ success: false, message: `Invalid message ID format: ${id}` });
      }

      // Find message
      const message = await BoardMessage.findById(id);
      if (!message) {
        console.warn("[updateMessageStatus] Message not found:", id);
        return res.status(404).json({ success: false, message: `Message not found: ${id}` });
      }

      // Find conversation
      const conversation = await BoardConversation.findById(message.conversationId);
      if (!conversation) {
        console.warn("[updateMessageStatus] Conversation not found:", message.conversationId);
        return res.status(404).json({
          success: false,
          message: `Conversation not found: ${message.conversationId}`,
        });
      }

      // Verify user is a participant
      if (!conversation.participants.map((id) => id.toString()).includes(userId.toString())) {
        console.warn("[updateMessageStatus] Unauthorized user:", { userId, conversationId: message.conversationId });
        return res.status(403).json({
          success: false,
          message: `User ${userId} is not a participant in conversation: ${message.conversationId}`,
        });
      }

      // Update message status
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        message.isNewMessage = false;
        message.status = "read";
        await message.save();
        console.log("[updateMessageStatus] Message marked as read:", { messageId: id, userId });
      } else {
        console.log("[updateMessageStatus] Message already read by user:", { messageId: id, userId });
      }

      // Notify participants of status update
      if (io) {
        console.log("[updateMessageStatus] Emitting messageUpdated to room:", `conversation:${message.conversationId}`);
        io.to(`conversation:${message.conversationId}`).emit("messageUpdated", {
          id: message._id,
          conversationId: message.conversationId,
          status: message.status,
          readBy: message.readBy,
        });
      } else {
        console.warn("[updateMessageStatus] Socket.IO not initialized");
      }

      res.status(200).json({ success: true, data: message });
    } catch (error) {
      console.error("[updateMessageStatus] Error:", {
        message: error.message,
        stack: error.stack,
        messageId: req.params.id,
        userId,
      });
      res.status(500).json({ success: false, message: `Error updating message status: ${error.message}` });
    }
  };

  return {
    conversationFetch,
    fetchMessages,
    sendMessage,
    updateMessageStatus,
  };
};

export default boardMessageController;