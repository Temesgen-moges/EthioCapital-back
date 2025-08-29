import mongoose from 'mongoose';

const sssApplicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number'],
  },
  socialMediaLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    other: { type: String, trim: true },
  },
  profilePicture: {
    type: String, // Store as base64 or URL
    required: true,
  },
  educationHistory: [
    {
      institution: { type: String, required: true, trim: true },
      degree: { type: String, required: true, trim: true },
      fieldOfStudy: { type: String, trim: true },
    },
  ],
  fundingPurpose: {
    type: String,
    enum: ['university', 'research', 'conference', 'other'],
    required: true,
  },
  fundingAmount: {
    type: Number,
    required: true,
    min: [0, 'Funding amount must be positive'],
  },
  fundingRaised: {
    type: Number,
    default: 0,
    min: [0, 'Funding raised cannot be negative'],
  },
  fundingDuration: {
    type: String,
    enum: ['3', '6', '9', '12'],
    required: true,
  },
  financialNeedsDescription: {
    type: String,
    required: true,
    trim: true,
  },
  documents: {
    academicTranscripts: { type: String, required: true }, // Base64 or URL
    researchProposal: { type: String }, // Required only for research purpose
    additionalDocuments: [{ type: String }], // Array of base64 or URLs
  },
  submissionDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Create index on userId for efficient queries
sssApplicationSchema.index({ userId: 1 });

export const SssApplication = mongoose.model('SssApplication', sssApplicationSchema);