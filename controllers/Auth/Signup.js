// import User from "../../models/User.js";
// import bcrypt from "bcrypt";

// export const signup = async (req, res) => {
//     console.log("inside of signup controller");
//     console.log("req.body", req.body);

//     const adminEmail="admin@gmail.com";
//     const adminPassword="admin123";
//     const adminFullName="Admin Admin";
//     const adminRole="admin";

//     const admin = await User.findOne({email:adminEmail});

//     if(!admin){
//         console.log("creating admin");
//         const admin = await User.create({
//             email:adminEmail,
//             password:adminPassword,
//             fullName:adminFullName,
//             role:adminRole
//         });
//         console.log("admin created");
//     }
//     const {
//         email,
//         password,
//         fullName,
//         role,
//         companyName,
//         industry,
//         investmentInterests,
//         idDocument,
//         bankStatement,
//         portfolioEvidence,
//         businessPlan,
//         fundingPurpose,
//         requestedAmount,
//         educationDetails,
//     } = req.body;
//     // const hashedPassword = await bcrypt.hash(password, 10);
//     console.log("email", email);
//     // console.log("password", hashedPassword);
//     console.log("fullName", fullName);

//     try {
//         console.log("saving");

//         const user = await User.create({
//             email,
//             password,
//             fullName,
//             role,
//             companyName,
//             industry,
//             investmentInterests,
//             idDocument,
//             bankStatement,
//             portfolioEvidence,
//             businessPlan,
//             fundingPurpose,
//             requestedAmount,
//             educationDetails,
//         });
//         console.log("saved");
//         res.status(201).json(user);
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).json({ message: "Error creating user", error: error.message });
//     }

// };


import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  console.log("Inside signup controller");
  console.log("req.body", req.body);

  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";
  const adminFullName = "Admin Admin";
  const adminRole = "admin";

  try {
    // Check and create admin user if not exists
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      console.log("Creating admin");
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        email: adminEmail,
        password: hashedAdminPassword,
        fullName: adminFullName,
        role: adminRole,
      });
      console.log("Admin created");
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

    console.log("email", email);
    console.log("fullName", fullName);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // User.create handles password hashing via pre-save hook
    const user = await User.create({
      email,
      password, // Will be hashed by pre-save hook
      fullName,
      role: role || "investor", // Default to investor if not provided
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

    console.log("User saved");

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};