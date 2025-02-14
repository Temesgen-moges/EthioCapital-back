import mongoose from 'mongoose';

const SocialLinksSchema = new mongoose.Schema({
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    website: { type: String, default: "" },
    instagram: { type: String, default: "" },
    email: { type: String, required: true },
});

const InvestmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    result: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, default: null }, // Store image URLs
});

const UserProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true, // Make sure every idea is associated with a user
        },
        // Personal Information
        name: { type: String, required: true },
        title: { type: String, required: true },
        photo: { type: String, default: null }, // Store image URL
        about: { type: String, required: true },

        // Investment Details
        capital: { type: String, required: true },
        experience: { type: String, required: true },
        successfulExits: { type: Number, default: 0 },
        portfolioCompanies: { type: Number, default: 0 },

        // Fields and Preferences
        preferredFields: [{ type: String }],
        minimumInvestment: { type: Number },
        maximumInvestment: { type: Number },

        // Social Links
        socialLinks: { type: SocialLinksSchema, default: {} },

        // Portfolio
        previousInvestments: [InvestmentSchema],
    },
    { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.model("UserProfile", UserProfileSchema);