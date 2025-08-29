import DocumentAccessRequest from "../../models/DocumentAccessRequest.js";
import BusinessIdea from "../../models/BussinessIdea.js";
import User from "../../models/User.js";

// Request document access
export const requestDocumentAccess = async (req, res) => {
  const { ideaId, requesterId } = req.body;

  try {
    const idea = await BusinessIdea.findById(ideaId).populate("user");
    if (!idea) {
      return res.status(404).json({ message: "Business idea not found" });
    }

    if (idea.user._id.toString() === requesterId) {
      return res.status(400).json({ message: "You already have access as the entrepreneur" });
    }

    const existingRequest = await DocumentAccessRequest.findOne({
      ideaId,
      requesterId,
      status: "pending",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already pending" });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: "Requester not found" });
    }

    const request = new DocumentAccessRequest({
      ideaId,
      requesterId,
      entrepreneurId: idea.user._id,
      ideaTitle: idea.title,
      requesterName: requester.fullName,
    });

    await request.save();

    if (req.io) {
      console.log(`Emitting newDocumentAccessRequest to ${idea.user._id}`);
      req.io.to(idea.user._id.toString()).emit("newDocumentAccessRequest", {
        requestId: request._id,
        ideaTitle: idea.title,
        requesterName: requester.fullName,
      });
    }

    res.status(201).json({ message: "Access request sent successfully" });
  } catch (error) {
    console.error("Error requesting document access:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get access status for a user and idea
export const getAccessStatus = async (req, res) => {
  const { ideaId, userId } = req.params;

  try {
    const idea = await BusinessIdea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Business idea not found" });
    }

    if (idea.user.toString() === userId) {
      return res.json({ hasAccess: true });
    }

    const request = await DocumentAccessRequest.findOne({
      ideaId,
      requesterId: userId,
      status: "approved",
    });

    const hasAccess = !!request;
    res.json({ hasAccess });
  } catch (error) {
    console.error("Error fetching document access status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all access requests for an entrepreneur
export const getAccessRequests = async (req, res) => {
  const { entrepreneurId } = req.params;

  try {
    if (req.user.userId !== entrepreneurId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const requests = await DocumentAccessRequest.find({
      entrepreneurId,
      status: "pending",
    }).populate("requesterId", "fullName");

    res.json({ requests });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve or deny a request
export const handleAccessRequestAction = async (req, res) => {
  const { requestId, action } = req.body;

  // Validate action
  if (!["approve", "deny"].includes(action)) {
    return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'deny'." });
  }

  try {
    const request = await DocumentAccessRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.entrepreneurId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    // Map action to schema-compatible status
    const status = action === "approve" ? "approved" : "denied";
    request.status = status;
    await request.save();

    // Emit socket.io event for approved requests
    if (req.io && status === "approved") {
      console.log(`Emitting documentAccessApproved to ${request.requesterId}`);
      req.io.to(request.requesterId.toString()).emit("documentAccessApproved", {
        ideaId: request.ideaId,
        ideaTitle: request.ideaTitle,
      });
    }

    res.json({ message: `Request ${status} successfully` });
  } catch (error) {
    console.error(`Error ${action}ing request:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};