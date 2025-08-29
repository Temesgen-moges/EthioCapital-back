import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  txRef: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentApplication', required: true },
  studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('Donation', donationSchema);