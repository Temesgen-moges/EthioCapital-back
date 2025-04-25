import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  businessIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessIdea',
    required: true,
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['Chairman', 'Investor'], required: true },
      shares: { type: Number, default: 0 },
      bankName: { type: String },
      accountDetails: { type: String },
    },
  ],
  shareholders: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      shares: { type: Number, default: 0 },
    },
  ],
  votes: {
    releaseFunds: { type: Number, default: 0 },
    extendTime: { type: Number, default: 0 },
    refundInvestors: { type: Number, default: 0 },
  },
  messages: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      time: { type: Date, default: Date.now },
    },
  ],
  currentFunds: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries by businessIdea
boardSchema.index({ businessIdea: 1 });

export default mongoose.model('Board', boardSchema);