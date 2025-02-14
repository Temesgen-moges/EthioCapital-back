import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        entrepreneurName: { type: String, required: true },
        entrepreneurImage: { type: String }, // URL or file path
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
        useOfFunds: [{ type: String }], // Array of strings
        financials: {
            valuation: { type: String },
            revenue2023: { type: String },
            projectedRevenue2024: { type: String },
            breakEvenPoint: { type: String },
        },
        traction: [{ type: String }], // Array of strings
        team: [
            {
                name: { type: String },
                role: { type: String },
                expertise: { type: String },
            },
        ],
        documents: {
            businessRegistration: { type: String }, // File path or URL
            financialProjections: { type: String },
            patentDocumentation: { type: String },
            pitchDeck: { type: String },
            teamCertifications: { type: String },
            marketResearchReport: { type: String },
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true, // Make sure every idea is associated with a user
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const BusinessIdea = mongoose.model('BusinessIdea', ideaSchema);
export default BusinessIdea;
