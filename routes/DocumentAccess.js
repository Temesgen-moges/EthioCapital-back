import express from "express";
import {
  requestDocumentAccess,
  getAccessStatus,
  getAccessRequests,
  handleAccessRequestAction,
} from "../controllers/DocumentAccess/DocumentAccess.js";
import { authenticate } from "../middleware/Authenticate.js";
import DocumentAccessRequest from "../models/DocumentAccessRequest.js"; // Import the model
import BusinessIdea from "../models/BussinessIdea.js"; // Import the model

const documentAccessRouter = express.Router();

// Existing routes
documentAccessRouter.post("/request", authenticate, requestDocumentAccess);
documentAccessRouter.get("/status/:ideaId/:userId", authenticate, getAccessStatus);
documentAccessRouter.get("/requests/:entrepreneurId", authenticate, getAccessRequests);
documentAccessRouter.post("/action", authenticate, handleAccessRequestAction);

// New route for fetching requests by ideaId
documentAccessRouter.get("/requests/idea/:ideaId", authenticate, async (req, res) => {
  try {
    const { ideaId } = req.params;
    const userId = req.user.userId; // From authenticate middleware

    // Verify the user owns the idea
    const idea = await BusinessIdea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Business idea not found" });
    }
    if (idea.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You do not own this idea" });
    }

    // Fetch requests for this idea
    const requests = await DocumentAccessRequest.find({ ideaId })
      .populate("requesterId", "fullName email") // Populate requester details
      .lean();

    // Format response
    const formattedRequests = requests.map((req) => ({
      _id: req._id,
      ideaId: req.ideaId,
      requesterId: req.requesterId._id,
      requesterName: req.requesterId.fullName || req.requesterName || "Unknown",
      status: req.status,
      createdAt: req.createdAt,
      ideaTitle: req.ideaTitle,
    }));

    res.status(200).json({ requests: formattedRequests });
  } catch (error) {
    console.error("Error fetching document access requests by idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default documentAccessRouter;