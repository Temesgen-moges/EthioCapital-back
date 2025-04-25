import mongoose from 'mongoose';

const FundReleaseSchema = new mongoose.Schema({
  businessIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessIdea',
    required: [true, 'Business idea ID is required'],
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
  },
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
  },
  accountNumber: {
    type: String,
    required: [true, 'Account number is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be greater than 0'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'sent_to_admin', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status',
    },
    default: 'pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required'],
  },
  votes: {
    type: Number,
    default: 0,
    min: 0,
  },
  voters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  adminNotified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries
FundReleaseSchema.index({ businessIdea: 1, createdAt: -1 });

export default mongoose.model('FundRelease', FundReleaseSchema);