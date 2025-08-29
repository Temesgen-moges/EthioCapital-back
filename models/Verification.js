import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  investmentCapacity: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusinessIdea",
    required: true,
  },
  idPictureUrl: {
    type: String,
    required: true,
    // Removed strict URL regex to accept file paths
  },
  profilePictureUrl: {
    type: String,
    required: true,
    // Removed strict URL regex to accept file paths
  },
  status: {
    type: String,
    enum: ["draft", "submitted", "approved", "rejected"],
    default: "submitted",
  },
  rejectionReason: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model("Verification", verificationSchema);