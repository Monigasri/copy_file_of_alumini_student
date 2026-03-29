import mongoose from "mongoose";

/**
 * Student model - separate collection for student users.
 * Replaces the previous single User model for role "student".
 */
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, default: "student", enum: ["student"] },

    // Academic Details
    college: { type: String, trim: true },
    degree: { type: String, trim: true }, // e.g. B.Tech
    department: { type: String, trim: true }, // e.g. CSE
    year: { type: String, enum: ["1st", "2nd", "3rd", "4th", "Graduated"] },
    cgpa: { type: Number },
    graduationYear: { type: Number },
    course: { type: String, trim: true }, // Keeping for backward compatibility or alias to degree/dept

    // Skills & Interests
    skills: [{ type: String }],
    areaOfInterest: [{ type: String }],

    // Socials
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },

    // Personal & Preferences
    description: { type: String, trim: true }, // Bio/Career Goal
    location: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    mentorshipDomain: { type: String, trim: true },
    meetingMode: { type: String, enum: ["Online", "Offline", "Both"], default: "Online" },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model("Student", studentSchema);
