import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/* ================= HELPER FUNCTIONS ================= */

function toClientStudent(doc) {
  if (!doc) return null;

  const obj = doc.toObject
    ? doc.toObject({ versionKey: false })
    : doc;

  const { password, _id, ...rest } = obj;

  return {
    id: _id.toString(),
    ...rest,
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: "student" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
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
      location,
      photoUrl,
      mentorshipDomain,
      meetingMode,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Name, email, password and phone are required",
      });
    }

    const existing = await Student.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      role: "student",

      college,
      degree,
      department,
      year: year || undefined,
      cgpa: cgpa ? Number(cgpa) : undefined,
      graduationYear: graduationYear
        ? Number(graduationYear)
        : undefined,

      skills: Array.isArray(skills) ? skills : [],
      areaOfInterest: Array.isArray(areaOfInterest)
        ? areaOfInterest
        : [],

      linkedin,
      github,
      description,
      location,
      photoUrl,
      mentorshipDomain,
      meetingMode,
    });

    const clientUser = toClientStudent(student);
    const token = signToken(clientUser);

    return res.status(201).json({
      user: clientUser,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: error.message || "Failed to register student",
    });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const student = await Student.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!student) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      student.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const clientUser = toClientStudent(student);
    const token = signToken(clientUser);

    return res.json({
      user: clientUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
});

/* ================= GET STUDENT BY ID ================= */

router.get("/:id", authRequired, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .select("-password")
      .lean();

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(student);
  } catch (error) {
    console.error("Fetch student error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* ================= UPDATE STUDENT PROFILE ================= */

router.put("/:id", authRequired, async (req, res) => {
  try {
    // Only allow students to update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        message: "Not authorized to update this profile",
      });
    }

    const {
      name,
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
      location,
      photoUrl,
      mentorshipDomain,
      meetingMode,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        message: "Name and phone are required",
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        phone: phone.trim(),
        college,
        degree,
        department,
        year: year || undefined,
        cgpa: cgpa ? Number(cgpa) : undefined,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        skills: Array.isArray(skills) ? skills : [],
        areaOfInterest: Array.isArray(areaOfInterest) ? areaOfInterest : [],
        linkedin,
        github,
        description,
        location,
        photoUrl,
        mentorshipDomain,
        meetingMode,
      },
      { new: true }
    ).select("-password");

    if (!updatedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    return res.json({
      student: toClientStudent(updatedStudent),
    });
  } catch (error) {
    console.error("Update student error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update student profile",
    });
  }
});

export default router;