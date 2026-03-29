import express from "express";

import User from "../models/User.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

/* ================= HELPER ================= */

function toClientUser(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const { password, _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

/* ================= UPDATE PROFILE ================= */
/**
 * PUT /api/users/profile
 * Updates authenticated user's profile (Student / Alumni / Legacy User)
 */
router.put("/profile", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user;

    let Model;

    if (role === "student") {
      Model = Student;
    } else if (role === "alumni") {
      Model = Alumni;
    } else {
      Model = User; // fallback for legacy users
    }

    // Copy all fields from request
    const updates = { ...req.body };

    // Prevent sensitive updates
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.id;
    delete updates.email; // prevent email change (optional but safer)

    // Convert numeric fields safely
    if (updates.totalExperience !== undefined) {
      updates.totalExperience = Number(updates.totalExperience);
    }

    if (updates.yearsInCurrentCompany !== undefined) {
      updates.yearsInCurrentCompany = Number(updates.yearsInCurrentCompany);
    }

    if (updates.cgpa !== undefined) {
      updates.cgpa = Number(updates.cgpa);
    }

    if (updates.graduationYear !== undefined) {
      updates.graduationYear = Number(updates.graduationYear);
    }

    // Convert skills if sent as string
    if (typeof updates.skills === "string") {
      updates.skills = updates.skills
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }

    // Convert areaOfInterest if sent as string
    if (typeof updates.areaOfInterest === "string") {
      updates.areaOfInterest = updates.areaOfInterest
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    }

    const updatedUser = await Model.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: toClientUser(updatedUser) });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;