import User from "../../models/User.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

export const resetPassword = async (req, res) => {
  console.log("Inside Reset Password controller");
  console.log("req.params", req.params);
  console.log("req.body", req.body);

  const { token } = req.params;
  const { password } = req.body;

  try {
    // Validate password
    if (!password || password.length < 6) {
      console.log("Password validation failed: Password must be at least 6 characters");
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Hash the provided token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    console.log("Hashed token:", resetTokenHash);

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log("User found:", user ? user.email : "No user found");

    if (!user) {
      console.log("Invalid or expired reset token");
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Log password before hashing
    console.log("Password to hash:", password);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);
    user.password = hashedPassword;

    // Clear reset token and expiry
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save user and log result
    await user.save();
    console.log("User saved with new password for:", user.email);
    console.log("Stored password hash:", user.password);

    res.status(200).json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};