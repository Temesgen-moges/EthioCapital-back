import mongoose from 'mongoose';

const educationHistorySchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required']
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    enum: ['High School', 'Bachelor\'s', 'Master\'s']
  },
  fieldOfStudy: String
});

const documentsSchema = new mongoose.Schema({
  academicTranscripts: {
    type: String,
    required: [true, 'Academic transcripts are required']
  },
  researchProposal: String,
  additionalDocuments: [String]
});

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  educationHistory: {
    type: [educationHistorySchema],
    validate: {
      validator: v => Array.isArray(v) && v.length > 0,
      message: 'At least one education entry is required'
    }
  },
  fundingPurpose: {
    type: String,
    required: true,
    enum: ['university', 'research', 'conference', 'other'],
    default: 'university'
  },
  fundingAmount: {
    type: Number,
    required: [true, 'Funding amount is required'],
    min: [0, 'Funding amount cannot be negative']
  },
  financialNeedsDescription: {
    type: String,
    required: [true, 'Financial needs description is required']
  },
  documents: {
    type: documentsSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under-review', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

studentSchema.pre('validate', function(next) {
  if (this.fundingPurpose === 'research' && !this.documents.researchProposal) {
    this.invalidate('documents.researchProposal', 'Research proposal is required for research funding');
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

export default Student;