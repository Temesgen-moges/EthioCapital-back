import mongoose from "mongoose";
import FundRelease from "../../models/FundRelease.js";
import BusinessIdea from "../../models/BussinessIdea.js";
import BoardMemberDatabase from "../../models/Board.js";

// Existing controllers (submitFundRelease, voteFundRelease, getFundRelease, getAdminFundReleases, getFundReleasesByBusiness) remain unchanged except for voteFundRelease

export const submitFundRelease = async (req, res, next) => {
  console.log("[submitFundRelease] Controller reached:", {
    body: req.body,
    user: req.user
      ? { _id: req.user._id, role: req.user.role, email: req.user.email }
      : null,
  });

  try {
    const { businessIdeaId, bankName, accountName, accountNumber, amount } = req.body;
    const userId = req.user?._id;

    console.log("[submitFundRelease] Request data:", {
      businessIdeaId,
      bankName,
      accountName,
      accountNumber,
      amount,
      userId,
    });

    if (!req.user || !userId) {
      console.log("[submitFundRelease] Authentication failed: No user");
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (!businessIdeaId || !bankName || !accountName || !accountNumber || !amount || amount <= 0) {
      console.log("[submitFundRelease] Validation failed:", {
        businessIdeaId,
        bankName,
        accountName,
        accountNumber,
        amount,
      });
      return res.status(400).json({
        success: false,
        message: "All fields are required and amount must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(businessIdeaId)) {
      console.log("[submitFundRelease] Invalid businessIdeaId format:", businessIdeaId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid business idea ID format" });
    }

    console.log("[submitFundRelease] Fetching business idea:", businessIdeaId);
    const businessIdea = await BusinessIdea.findById(businessIdeaId).populate("user");
    if (!businessIdea) {
      console.log("[submitFundRelease] Business idea not found:", businessIdeaId);
      return res
        .status(404)
        .json({ success: false, message: "Business idea not found" });
    }

    if (!businessIdea.user || businessIdea.user._id.toString() !== userId.toString()) {
      console.log("[submitFundRelease] Unauthorized:", {
        userId,
        entrepreneurId: businessIdea.user?._id,
      });
      return res.status(403).json({
        success: false,
        message: "Only the entrepreneur can submit a fund release request",
      });
    }

    if (amount > (businessIdea.fundingRaised || 0)) {
      console.log("[submitFundRelease] Invalid amount:", {
        requested: amount,
        fundingRaised: businessIdea.fundingRaised,
      });
      return res.status(400).json({
        success: false,
        message: `Requested amount (ETB ${amount.toLocaleString()}) exceeds available funding (ETB ${(businessIdea.fundingRaised || 0).toLocaleString()})`,
      });
    }

    const fundRelease = new FundRelease({
      businessIdea: businessIdeaId,
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      amount,
      createdBy: userId,
      status: "pending",
      votes: 0,
      voters: [],
    });

    console.log("[submitFundRelease] Saving fund release:", fundRelease);

    const savedFundRelease = await fundRelease.save();
    console.log("[submitFundRelease] Fund release saved:", savedFundRelease._id);

    const io = req.app.get("io");
    if (io) {
      const board = await BoardMemberDatabase.findOne({ businessIdea: businessIdeaId });
      const boardMembers = board?.investors || [];
      console.log("[submitFundRelease] Notifying board members:", boardMembers.map((m) => m.userId.toString()));
      io.to(`business:${businessIdeaId}`).emit("newFundRelease", {
        fundReleaseId: savedFundRelease._id,
        businessIdeaId,
        bankName: savedFundRelease.bankName,
        accountName: savedFundRelease.accountName,
        accountNumber: savedFundRelease.accountNumber,
        amount: savedFundRelease.amount,
        createdBy: businessIdea.user.fullName || req.user.fullName || req.user.email,
        votes: savedFundRelease.votes,
        status: savedFundRelease.status,
      });
    } else {
      console.warn("[submitFundRelease] Socket.IO not initialized");
    }

    return res.status(201).json({
      success: true,
      message: "Fund release request submitted successfully",
      data: savedFundRelease,
    });
  } catch (error) {
    console.error("[submitFundRelease] Error:", {
      message: error.message,
      stack: error.stack,
      errors: error.errors || null,
    });

    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to submit fund release request",
      });
    }
    next(error);
  }
};

export const voteFundRelease = async (req, res, next) => {
  console.log("[voteFundRelease] Controller reached:", {
    body: req.body,
    user: req.user ? { _id: req.user._id, role: req.user.role } : null,
  });

  try {
    const { fundReleaseId } = req.body;
    const userId = req.user?._id;

    if (!fundReleaseId || !mongoose.Types.ObjectId.isValid(fundReleaseId)) {
      console.log("[voteFundRelease] Invalid fundReleaseId:", fundReleaseId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid fund release ID" });
    }

    const fundRelease = await FundRelease.findById(fundReleaseId);
    if (!fundRelease) {
      console.log("[voteFundRelease] Fund release not found:", fundReleaseId);
      return res
        .status(404)
        .json({ success: false, message: "Fund release not found" });
    }

    if (fundRelease.status !== "pending") {
      console.log("[voteFundRelease] Fund release not in pending status:", fundRelease.status);
      return res
        .status(400)
        .json({ success: false, message: "Fund release is not open for voting" });
    }

    // Uncomment and fix authorization if needed
    // const board = await BoardMemberDatabase.findOne({
    //   businessIdea: fundRelease.businessIdea,
    //   "investors.userId": userId,
    // });
    // if (!board) {
    //   console.log("[voteFundRelease] User is not an investor:", { userId, businessIdea: fundRelease.businessIdea });
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Only board member investors can vote" });
    // }

    if (fundRelease.voters.includes(userId)) {
      console.log("[voteFundRelease] User already voted:", userId);
      return res
        .status(400)
        .json({ success: false, message: "You have already voted" });
    }

    fundRelease.votes += 1;
    fundRelease.voters.push(userId);

    const totalBoardMembers = (await BoardMemberDatabase.findOne({ businessIdea: fundRelease.businessIdea }))?.investors.length || 4; // Fallback to 4 if board not found
    console.log("[voteFundRelease] totalBoardMembers:", totalBoardMembers);
    const majorityThreshold = Math.ceil(totalBoardMembers * (3 / 4)); // 3/4 threshold

    if (fundRelease.votes >= majorityThreshold) {
      fundRelease.status = "sent_to_admin";
      console.log("[voteFundRelease] Majority reached:", {
        votes: fundRelease.votes,
        threshold: majorityThreshold,
      });
    }

    await fundRelease.save();
    console.log("[voteFundRelease] Vote recorded:", fundRelease._id);

    const io = req.app.get("io");
    if (io) {
      io.to(`business:${fundRelease.businessIdea}`).emit("voteUpdated", {
        fundReleaseId: fundRelease._id,
        votes: fundRelease.votes,
        status: fundRelease.status,
      });

      if (fundRelease.status === "sent_to_admin") {
        io.to(`business:${fundRelease.businessIdea}`).emit("fundReleaseApproved", {
          fundReleaseId: fundRelease._id,
          businessIdeaId: fundRelease.businessIdea,
          bankName: fundRelease.bankName,
          accountName: fundRelease.accountName,
          accountNumber: fundRelease.accountNumber,
          amount: fundRelease.amount,
          votes: fundRelease.votes,
          status: fundRelease.status,
        });
        console.log("[voteFundRelease] Emitted fundReleaseApproved for fundReleaseId:", fundRelease._id);
      }
    } else {
      console.warn("[voteFundRelease] Socket.IO not initialized");
    }

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      data: fundRelease,
    });
  } catch (error) {
    console.error("[voteFundRelease] Error:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to record vote",
      });
    }
    next(error);
  }
};

export const getFundRelease = async (req, res, next) => {
  console.log("[getFundRelease] Controller reached:", {
    params: req.params,
    user: req.user ? { _id: req.user._id, role: req.user.role } : null,
  });

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("[getFundRelease] Invalid fundReleaseId:", id);
      return res
        .status(400)
        .json({ success: false, message: "Invalid fund release ID" });
    }

    const fundRelease = await FundRelease.findById(id).populate("businessIdea createdBy");
    if (!fundRelease) {
      console.log("[getFundRelease] Fund release not found:", id);
      return res
        .status(404)
        .json({ success: false, message: "Fund release not found" });
    }

    return res.status(200).json({
      success: true,
      data: fundRelease,
    });
  } catch (error) {
    console.error("[getFundRelease] Error:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch fund release",
      });
    }
    next(error);
  }
};

export const getAdminFundReleases = async (req, res, next) => {
  console.log("[getAdminFundReleases] Controller reached:", {
    user: req.user ? { _id: req.user._id, role: req.user.role } : null,
  });

  try {
    if (req.user?.role !== "admin") {
      console.log("[getAdminFundReleases] Unauthorized:", req.user?.role);
      return res
        .status(403)
        .json({ success: false, message: "Only admins can access this endpoint" });
    }

    const fundReleases = await FundRelease.find()
      .populate("businessIdea createdBy")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: fundReleases,
    });
  } catch (error) {
    console.error("[getAdminFundReleases] Error:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch fund releases",
      });
    }
    next(error);
  }
};

export const getFundReleasesByBusiness = async (req, res, next) => {
  console.log("[getFundReleasesByBusiness] Controller reached:", {
    params: req.params,
    user: req.user
      ? { _id: req.user._id, role: req.user.role, email: req.user.email }
      : null,
  });

  try {
    const { businessIdeaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(businessIdeaId)) {
      console.log("[getFundReleasesByBusiness] Invalid businessIdeaId:", businessIdeaId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid business idea ID" });
    }

    const businessIdea = await BusinessIdea.findById(businessIdeaId);
    if (!businessIdea) {
      console.log("[getFundReleasesByBusiness] Business idea not found:", businessIdeaId);
      return res
        .status(404)
        .json({ success: false, message: "Business idea not found" });
    }

    console.log("[getFundReleasesByBusiness] Business idea user:", {
      businessIdeaUserId: businessIdea.user?.toString(),
      requestingUserId: req.user?._id?.toString(),
    });

    const board = await BoardMemberDatabase.findOne({
      businessIdea: businessIdeaId,
      $or: [
        { "entrepreneur.userId": req.user?._id },
        { "investors.userId": req.user?._id },
      ],
    });

    console.log("[getFundReleasesByBusiness] Board query result:", {
      boardExists: !!board,
      entrepreneurUserId: board?.entrepreneur?.userId?.toString(),
      investorUserIds: board?.investors?.map((i) => i.userId.toString()),
      requestingUserId: req.user?._id?.toString(),
    });

    let userIdSame = false;
    for (let i = 0; i < businessIdea.investorContributions.length; i++) {
      console.log("the userId: ", businessIdea.investorContributions[i].user.toString());
      if (businessIdea.investorContributions[i].user.toString() === req.user?._id.toString()) {
        console.log("the userId is the same: ", businessIdea.investorContributions[i].user.toString());
        userIdSame = true;
      }
    }

    const isAuthorized = req.user?.role === "admin" || userIdSame || !!board;

    if (!isAuthorized) {
      console.log("[getFundReleasesByBusiness] Unauthorized:", {
        userId: req.user?._id,
        role: req.user?.role,
        isAdmin: req.user?.role === "admin",
        isEntrepreneur: businessIdea.user.toString() === req.user?._id.toString(),
        isBoardMember: !!board,
      });
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized to view fund releases" });
    }

    const fundReleases = await FundRelease.find({ businessIdea: businessIdeaId })
      .populate("createdBy")
      .sort({ createdAt: -1 });

    console.log("[getFundReleasesByBusiness] Fund releases fetched:", {
      count: fundReleases.length,
      fundReleaseIds: fundReleases.map((fr) => fr._id.toString()),
    });

    return res.status(200).json({
      success: true,
      data: fundReleases,
    });
  } catch (error) {
    console.error("[getFundReleasesByBusiness] Error:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch fund releases",
      });
    }
    next(error);
  }
};

// New controller for fetching fund releases by status
export const getFundReleasesByStatus = async (req, res, next) => {
  console.log("[getFundReleasesByStatus] Controller reached:", {
    params: req.params,
    user: req.user ? { _id: req.user._id, role: req.user.role } : null,
  });

  try {
    const { status } = req.params;

    if (!['pending', 'sent_to_admin', 'approved', 'rejected'].includes(status)) {
      console.log("[getFundReleasesByStatus] Invalid status:", status);
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    if (req.user?.role !== "admin") {
      console.log("[getFundReleasesByStatus] Unauthorized:", req.user?.role);
      return res
        .status(403)
        .json({ success: false, message: "Only admins can access this endpoint" });
    }

    const fundReleases = await FundRelease.find({ status })
      .populate("createdBy") // Only populate createdBy, not businessIdea
      .sort({ createdAt: -1 });

    console.log("[getFundReleasesByStatus] Fund releases fetched:", {
      status,
      count: fundReleases.length,
      fundReleaseIds: fundReleases.map((fr) => fr._id.toString()),
    });

    return res.status(200).json({
      success: true,
      data: fundReleases,
    });
  } catch (error) {
    console.error("[getFundReleasesByStatus] Error:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to fetch fund releases",
      });
    }
    next(error);
  }
};

// New controller for approving/rejecting fund releases
export const updateFundReleaseStatus = async (req, res, next) => {
  console.log("[updateFundReleaseStatus] Controller reached:", {
    params: req.params,
    user: req.user ? { _id: req.user._id, role: req.user.role } : null,
  });

  try {
    const { fundReleaseId, action } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fundReleaseId)) {
      console.log("[updateFundReleaseStatus] Invalid fundReleaseId:", fundReleaseId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid fund release ID" });
    }

    if (!['approve', 'reject'].includes(action)) {
      console.log("[updateFundReleaseStatus] Invalid action:", action);
      return res
        .status(400)
        .json({ success: false, message: "Invalid action. Use 'approve' or 'reject'" });
    }

    if (req.user?.role !== "admin") {
      console.log("[updateFundReleaseStatus] Unauthorized:", req.user?.role);
      return res
        .status(403)
        .json({ success: false, message: "Only admins can perform this action" });
    }

    const fundRelease = await FundRelease.findById(fundReleaseId);
    if (!fundRelease) {
      console.log("[updateFundReleaseStatus] Fund release not found:", fundReleaseId);
      return res
        .status(404)
        .json({ success: false, message: "Fund release not found" });
    }

    if (fundRelease.status !== "sent_to_admin") {
      console.log("[updateFundReleaseStatus] Invalid status for action:", fundRelease.status);
      return res
        .status(400)
        .json({ success: false, message: "Fund release is not in 'sent_to_admin' status" });
    }

    fundRelease.status = action === 'approve' ? 'approved' : 'rejected';
    await fundRelease.save();

    console.log("[updateFundReleaseStatus] Fund release updated:", {
      fundReleaseId,
      newStatus: fundRelease.status,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`business:${fundRelease.businessIdea}`).emit("fundReleaseStatusUpdated", {
        fundReleaseId: fundRelease._id,
        businessIdeaId: fundRelease.businessIdea,
        status: fundRelease.status,
      });
      console.log("[updateFundReleaseStatus] Emitted fundReleaseStatusUpdated for fundReleaseId:", fundRelease._id);
    } else {
      console.warn("[updateFundReleaseStatus] Socket.IO not initialized");
    }

    return res.status(200).json({
      success: true,
      message: `Fund release ${action}d successfully`,
      data: fundRelease,
    });
  } catch (error) {
    console.error("[updateFundReleaseStatus] Error:", {
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        message: error.message || "Failed to update fund release status",
      });
    }
    next(error);
  }
};