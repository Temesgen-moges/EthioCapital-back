import User from "../../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const forgotPassword = async (req, res) => {
  console.log("Forgot Password route hit");
  console.log("req.body", req.body);

  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    console.log("user", user);

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "No user found with this email." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token and expiry (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log("Reset token saved for user:", user.email);

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Reset URL:", resetUrl);

    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "temu1554@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify transporter
    try {
      await transporter.verify();
      console.log("Nodemailer transport verified");
    } catch (error) {
      console.error("Nodemailer verification failed:", error);
      throw new Error("Failed to connect to email server");
    }

    // Email content
    const mailOptions = {
      from: '"Ethio Capital" <temu1554@gmail.com>',
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Ethio Capital account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Ethio Capital Team</p>
      `,
    };

    // Send email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset email sent to", user.email, "Message ID:", info.messageId);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw new Error("Failed to send reset email");
    }

    res.status(200).json({ message: "Password reset email sent. Please check your inbox." });
  } catch (error) {
    console.error("Forgot Password error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};