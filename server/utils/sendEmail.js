import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load root .env regardless of where the server is launched from.
dotenv.config({ path: new URL("../../.env", import.meta.url) });

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ THIS LINE IS THE FIX
export const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `Alumni Connect <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(
      `✅ Email sent: "${subject}" -> ${to} (${info?.messageId || "no-id"})`
    );
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    return null;
  }
};