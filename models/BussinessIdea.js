import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    entrepreneurName: { type: String, required: true },
    entrepreneurImage: { type: String },
    entrepreneurBackground: { type: String },
    entrepreneurEducation: { type: String },
    entrepreneurLocation: { type: String },
    overview: { type: String },
    businessCategory: { type: String },
    problemStatement: { type: String },
    solution: { type: String },
    marketSize: { type: String },
    currentStage: { type: String },
    fundingNeeded: { type: String },
    fundingRaised: { type: String },
    useOfFunds: [{ type: String }],
    investmentTimeline: { type: String }, // Added for timeline selection
    entrepreneurEquity: { type: String }, // Added for equity split
    investorEquity: { type: String }, // Added for equity split
    financials: {
      valuation: { type: String },
      revenue2023: { type: String },
      projectedRevenue2024: { type: String },
      breakEvenPoint: { type: String },
    },
    traction: [{ type: String }],
    team: [
      {
        name: { type: String },
        role: { type: String },
        expertise: { type: String },
      },
    ],
    documents: {
      businessRegistration: { type: String },
      financialProjections: { type: String },
      patentDocumentation: { type: String },
      pitchDeck: { type: String },
      teamCertifications: { type: String },
      marketResearchReport: { type: String },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investorContributions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        equityPercentage: { type: Number },
      },
    ], // Added
    boardCreated: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    ranking: {
      type: String,
      enum: ['', 'Gold', 'Silver', 'Bronze'],
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const BusinessIdea = mongoose.model('BusinessIdea', ideaSchema);
export default BusinessIdea;