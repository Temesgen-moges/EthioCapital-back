import jwt from "jsonwebtoken";

const JWT_SECRET = "capital-backend-secret"; // Ensure you use the same secret key as in login

export const authenticate = (req, res, next) => {
  // Get token from Authorization header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token and decode the payload
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach the decoded user data to the request object
    req.user = decoded;
    next(); // Call the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
