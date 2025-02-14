import Message from "../../models/Message.js";
import Conversation from "../../models/Conversation.js";
import mongoose from "mongoose";

export const fetchMessages = async (req, res) => {
  try {
    const { conversationId, ideaId } = req.params;
    const { userId } = req.user;

    // console.log("conversationId", conversationId);
    // console.log("ideaId", ideaId);
    // console.log("request", req.params);

    // 1. Log both IDs explicitly
    // console.log("Exact IDs being used:", {
    //   conversationId: conversationId.toString(),
    //   ideaId: ideaId.toString()
    // });

    // 2. Try finding by just conversationId first
    // const conversationById = await Conversation.findById(conversationId);
    // console.log("Finding by just conversationId:", conversationById);

    // // 3. Try finding by just ideaId
    // const conversationsByIdea = await Conversation.find({ idea: ideaId });
    // console.log("All conversations with this ideaId:", conversationsByIdea);

    // 4. Original query with explicit fields logged
    const conversation = await Conversation.findOne({
      _id: conversationId,
      idea: ideaId,
    }).lean(); // Using lean() to get plain object
    // console.log("user id", userId);

    // console.log("Final query result:", conversation.participants);


    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    if (!conversation.participants.map(id => id.toString()).includes(userId)) {
      return res.status(403).json({ message: "Unauthorized access." });
    }
    

    const messages = await Message.find({ conversationId }).sort({
      timestamp: -1,
    });

    // console.log("Messages:", messages);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Full error:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

export const conversationFetch = async (req, res) => {
  const { participants, ideaId } = req.body; // Ensure the request includes ideaId

  // console.log("idea id", ideaId);
  // console.log("participants", participants);

  try {
    if (participants.length !== 2) {
      return res
        .status(400)
        .json({ error: "A conversation must have exactly two participants." });
    }

    let conversation = await Conversation.findOne({
      idea: ideaId,
      participants: { $all: participants },
    });

    // console.log("conversationn", conversation);
    if (conversation) {
      return res.json(conversation);
    }

    // If no conversation exists for this idea between these two participants, create a new one
    conversation = new Conversation({ idea: ideaId, participants });
    // console.log("conversation", conversation);
    await conversation.save();

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error processing conversation:", error);
    res.status(500).json({ error: "Failed to start conversation." });
  }
};

export const updateIsNewMessage = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("id:",id)
    
    const message = await Message.findById(id);
    message.isNew = false;
    await message.save();
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Error updating isNew" });
  }
};


export const fetchUserMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log("userId:", userId);
    
    // Step 1: Get all conversations that include this user.
    const conversations = await Conversation.find({ participants: userId });
    
    // If no conversations found, you can return an empty array early.
    if (!conversations.length) {
      return res.status(200).json([]);
    }
    
    // Extract conversation IDs.
    const conversationIds = conversations.map(conv => conv._id);
    
    // Step 2: Find all messages from these conversations.
    // If you want only unread messages, add `isNew: true` to the query.
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
      // Uncomment the next line if you only want unread messages:
      isNew: true
    }).populate({
      path: "conversationId",
      select: "idea participants lastMessage", // Select only the fields you need
    })
    .sort({ timestamp: -1 });;
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ message: "Error fetching user messages" });
  }
};