import mongoose from 'mongoose';

const educationHistorySchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String },
});

const socialMediaSchema = new mongoose.Schema({
  linkedIn: { type: String },
  twitter: { type: String },
  github: { type: String },
  other: { type: String },
});

const documentsSchema = new mongoose.Schema({
  academicTranscripts: { type: String },
  researchProposal: { type: String },
  additionalDocuments: [{ type: String }],
});

const studentApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  contactEmail: { type: String, required: true },
  profilePicture: { type: String },
  socialMedia: socialMediaSchema,
  portfolioDescription: { type: String, required: true },
  educationHistory: [educationHistorySchema],
  fundingPurpose: {
    type: String,
    enum: ['university', 'research', 'conference', 'other'],
    default: 'university',
  },
  fundingAmount: { type: Number, required: true },
  fundingDuration: {
    type: String,
    enum: ['3', '6', '9', '12'],
    required: true,
  },
  fundingRaised: { type: Number, default: 0 },
  financialNeedsDescription: { type: String, required: true },
  documents: documentsSchema,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('StudentApplication', studentApplicationSchema);