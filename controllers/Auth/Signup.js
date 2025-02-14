import User from "../../models/User.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
    console.log("inside of signup controller");
    console.log("req.body", req.body);

    const adminEmail="admin@gmail.com";
    const adminPassword="admin123";
    const adminFullName="Admin Admin";
    const adminRole="admin";

    const admin = await User.findOne({email:adminEmail});

    if(!admin){
        console.log("creating admin");
        const admin = await User.create({
            email:adminEmail,
            password:adminPassword,
            fullName:adminFullName,
            role:adminRole
        });
        console.log("admin created");
    }
    const {
        email,
        password,
        fullName,
        role,
        companyName,
        industry,
        investmentInterests,
        idDocument,
        bankStatement,
        portfolioEvidence,
        businessPlan,
        fundingPurpose,
        requestedAmount,
        educationDetails,
    } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10);
    console.log("email", email);
    // console.log("password", hashedPassword);
    console.log("fullName", fullName);

    try {
        console.log("saving");

        const user = await User.create({
            email,
            password,
            fullName,
            role,
            companyName,
            industry,
            investmentInterests,
            idDocument,
            bankStatement,
            portfolioEvidence,
            businessPlan,
            fundingPurpose,
            requestedAmount,
            educationDetails,
        });
        console.log("saved");
        res.status(201).json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }

};