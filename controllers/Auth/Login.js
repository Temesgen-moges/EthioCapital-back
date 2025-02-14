import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    console.log("inside of Login controller");
    console.log("req.body", req.body);

    const { email, password } = req.body;
    // const hashedPassword = await bcrypt.hash(password, 10);
    console.log("email", email);

    const JWT_SECRET = "capital-backend-secret";

    try {
        //find user by email
        const user = await User.findOne({ email });

        console.log("user", user);
        
        // If no user is found, return an error
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare the provided password with the hashed password
        const isMatch = await user.comparePassword(password);

        console.log("isMatch", isMatch);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role , email: user.email, },  // Payload (user data we want to include)
            JWT_SECRET,  // Secret key for signing
            { expiresIn: "1h" }  // Token expiration time (1 hour in this case)
        );

        // Send the user data and token in the response
        res.status(200).json({
            message: "Login successful",
            user: {
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token, // Include the JWT token in the response
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error: error.message });
    }

};