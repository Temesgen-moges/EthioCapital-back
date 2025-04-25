import mongoose from 'mongoose';

const boardMemberDatabaseSchema = new mongoose.Schema({
  businessIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessIdea',
    required: true,
  },
  ideaDetails: {
    title: { type: String, required: true },
    fundingNeeded: { type: Number, required: true },
    fundingRaised: { type: Number, required: true },
    entrepreneurEquity: { type: Number, required: true },
    investorEquity: { type: Number, required: true },
    description: { type: String },
  },
  entrepreneur: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
  },
  investors: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      amount: { type: Number, required: true },
      shares: { type: Number, required: true },
      equityPercentage: { type: Number, required: true },
      timestamp: { type: Date, required: true },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'in_review', 'selected', 'rejected'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('BoardMemberDatabase', boardMemberDatabaseSchema);