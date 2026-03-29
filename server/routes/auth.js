import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import { authRequired } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js"; // ✅ ADDED

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function toClientUser(userDoc) {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject({ versionKey: false }) : userDoc;
  const { password, _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id?.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await Student.findOne({ email: normalizedEmail });
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const clientUser = toClientUser(user);
      const token = signToken(clientUser);
      return res.json({ user: clientUser, token });
    }

    user = await Alumni.findOne({ email: normalizedEmail });
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const clientUser = toClientUser(user);
      const token = signToken(clientUser);
      return res.json({ user: clientUser, token });
    }

    user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const clientUser = toClientUser(user);
      const token = signToken(clientUser);
      return res.json({ user: clientUser, token });
    }

    return res.status(400).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Error in /api/auth/login", error);
    return res.status(500).json({ message: "Failed to login" });
  }
});

/* ================= REGISTER ================= */

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,

      phone,
      college,
      degree,
      department,
      year,
      cgpa,
      graduationYear,
      skills,
      areaOfInterest,
      linkedin,
      github,
      description,
      mentorshipDomain,
      meetingMode,
      location,
      photoUrl
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const normalizedEmail = email.toLowerCase();

    // check duplicates
    const existing =
      (await Student.findOne({ email: normalizedEmail })) ||
      (await Alumni.findOne({ email: normalizedEmail })) ||
      (await User.findOne({ email: normalizedEmail }));

    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create base user
    const baseUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    let profileDoc = null;

    // ✅ Create student profile
    if (role === "student") {
      profileDoc = await Student.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,

        college,
        degree,
        department,
        year,
        cgpa: Number(cgpa),
        graduationYear: Number(graduationYear),

        skills: Array.isArray(skills)
          ? skills
          : (skills || "").split(",").map(s => s.trim()).filter(Boolean),

        areaOfInterest: Array.isArray(areaOfInterest)
          ? areaOfInterest
          : (areaOfInterest || "").split(",").map(s => s.trim()).filter(Boolean),

        linkedin,
        github,
        description,
        mentorshipDomain,
        meetingMode,
        location,
        photoUrl,
      });
    }

    const clientUser = toClientUser(profileDoc || baseUser);
    const token = signToken(clientUser);

    return res.status(201).json({ user: clientUser, token });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Failed to register user" });
  }
});

/* ================= FORGOT PASSWORD (NEW) ================= */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user =
      (await Student.findOne({ email: normalizedEmail })) ||
      (await Alumni.findOne({ email: normalizedEmail })) ||
      (await User.findOne({ email: normalizedEmail }));

    if (!user) {
      // don't reveal if user exists
      return res.json({ ok: true });
    }

    const frontendBaseUrl = String(process.env.FRONTEND_URL || "http://localhost:8080").replace(
      /\/$/,
      ""
    );
    const resetLink = `${frontendBaseUrl}/reset-password/${user._id}`;

    await sendEmail(
      user.email,
      "Reset Password",
      `Hello ${user.name},

Click the link below to reset your password:

${resetLink}

If you did not request this, ignore this email.`
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ ok: false });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.findById(id);
    if (student) {
      student.password = await bcrypt.hash(password, 10);
      await student.save();
      return res.json({ message: "Password updated successfully", role: "student" });
    }

    const alumni = await Alumni.findById(id);
    if (alumni) {
      alumni.password = await bcrypt.hash(password, 10);
      await alumni.save();
      return res.json({ message: "Password updated successfully", role: "alumni" });
    }

    const legacyUser = await User.findById(id);
    if (!legacyUser) {
      return res.status(404).json({ message: "User not found" });
    }
    legacyUser.password = await bcrypt.hash(password, 10);
    await legacyUser.save();

    return res.json({
      message: "Password updated successfully",
      role: legacyUser.role || "student",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;