import Verification from "../../models/Verification.js"; // Adjust path to your Verification model

// Create a new verification
import path from 'path';

export const createVerification = async (req, res) => {
  try {
    console.log("Creating verification with data:", req.body, req.files);
    const { fullName, phone, investmentCapacity, experience, ideaId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      console.log("No _id in req.user:", req.user);
      return res.status(401).json({ message: "User ID not found in token" });
    }

    if (!fullName || !phone || !investmentCapacity || !experience || !ideaId) {
      console.log("Missing required fields:", { fullName, phone, investmentCapacity, experience, ideaId });
      return res.status(400).json({ message: "All fields are required" });
    }

    const idPictureFile = req.files?.idPicture?.[0];
    const profilePictureFile = req.files?.profilePicture?.[0];

    if (!idPictureFile || !profilePictureFile) {
      console.log("Missing file uploads:", { idPictureFile, profilePictureFile });
      return res.status(400).json({ message: "Both ID and profile pictures are required" });
    }

    // Convert full paths to relative paths
    const baseUploadPath = path.join(process.cwd(), 'Uploads').replace(/\\/g, '/');
    const idPictureUrl = idPictureFile.path.replace(baseUploadPath, '/uploads').replace(/\\/g, '/');
    const profilePictureUrl = profilePictureFile.path.replace(baseUploadPath, '/uploads').replace(/\\/g, '/');

    console.log("Generated URLs:", { idPictureUrl, profilePictureUrl });

    const verification = new Verification({
      userId,
      fullName,
      phone,
      investmentCapacity,
      experience,
      ideaId,
      idPictureUrl,
      profilePictureUrl,
      status: "submitted",
    });

    await verification.save();
    console.log("Verification created:", verification);
    res.status(201).json(verification);
  } catch (error) {
    console.error("Error in createVerification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Submit an existing verification (for drafts)
export const submitVerification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Submitting verification ID:", id);
    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    verification.status = "submitted";
    await verification.save();
    console.log("Verification submitted:", verification);
    res.status(200).json(verification);
  } catch (error) {
    console.error("Error in submitVerification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const { userId, ideaId } = req.params;
    console.log("Fetching status for user:", userId, "idea:", ideaId);
    const verification = await Verification.findOne({ userId, ideaId });
    if (!verification) {
      return res.status(200).json({ verification: null });
    }
    res.status(200).json({ verification });
  } catch (error) {
    console.error("Error in getVerificationStatus:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all verifications (admin only)
export const getVerifications = async (req, res) => {
  try {
    console.log("Fetching all verifications for admin");
    const verifications = await Verification.find()
      .populate("userId", "email")
      .populate("ideaId", "title");
    console.log("Fetched verifications:", verifications.length);
    res.status(200).json(verifications);
  } catch (error) {
    console.error("Error in getVerifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get verification by ID (admin only)
export const getVerificationById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching verification by ID:", id);
    const verification = await Verification.findById(id)
      .populate("userId", "email")
      .populate("ideaId", "title");
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    res.status(200).json(verification);
  } catch (error) {
    console.error("Error in getVerificationById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve a verification (admin only)
export const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Approving verification ID:", id);
    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    verification.status = "approved";
    await verification.save();
    console.log("Verification approved:", verification);

    // Emit Socket.IO event
    req.io.to(verification.userId.toString()).emit("verificationApproved", {
      ideaId: verification.ideaId,
      status: "approved",
    });

    res.status(200).json(verification);
  } catch (error) {
    console.error("Error in approveVerification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reject a verification (admin only)
export const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    console.log("Rejecting verification ID:", id, "Reason:", rejectionReason);
    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    verification.status = "rejected";
    verification.rejectionReason = rejectionReason || "No reason provided";
    await verification.save();
    console.log("Verification rejected:", verification);
    res.status(200).json(verification);
  } catch (error) {
    console.error("Error in rejectVerification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a verification
export const deleteVerification = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting verification ID:", id);
    const verification = await Verification.findByIdAndDelete(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }
    console.log("Verification deleted:", verification);
    res.status(200).json({ message: "Verification deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVerification:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};