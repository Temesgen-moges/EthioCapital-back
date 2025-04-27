import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "temu1554@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    console.log("Verifying Nodemailer transport...");
    await transporter.verify();
    console.log("Nodemailer transport verified");

    const mailOptions = {
      from: '"Ethio Capital" <temu1554@gmail.com>',
      to: "mogestemesgen3@gmail.com",
      subject: "Test Email from Ethio Capital",
      text: "This is a test email to confirm Nodemailer is working.",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from Ethio Capital to confirm email sending is working.</p>
        <p>If you see this, Nodemailer is configured correctly!</p>
      `,
    };

    console.log("Sending test email to mogestemesgen3@gmail.com...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent:", info.messageId);
  } catch (error) {
    console.error("Nodemailer error:", error);
  }
}

testEmail();