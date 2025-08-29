import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    txRef: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    projectId: { type: String, required: true },
    projectName: { type: String, required: true },
    amount: { type: Number, required: true },
    shares: { type: Number, required: true },
    equityPercentage: { type: Number, required: true },
    sharePrice: { type: Number, required: false },
    timestamp: { type: Date, required: true },
    paymentStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'completed', 'failed'],
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Added userId
    fundingRaised: { type: Number, required: false }, // Snapshot at investment time
    fundingNeeded: { type: Number, required: false }, // Snapshot at investment time
  },
  { suppressReservedKeysWarning: true }
);

export default mongoose.model('Investment', investmentSchema);