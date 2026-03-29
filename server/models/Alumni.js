import mongoose from "mongoose";

/**
 * Alumni model - separate collection for alumni users.
 * Replaces the previous single User model for role "alumni".
 */
const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Professional Details
    profession: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    previousCompany: { type: String, trim: true },
    industry: { type: String, trim: true },
    totalExperience: { type: Number, required: true },
    yearsInCurrentCompany: { type: Number, required: true },
    linkedin: { type: String, trim: true },
    skills: [{ type: String, trim: true }],

    // Education
    graduationYear: { type: Number },
    degree: { type: String, trim: true },
    college: { type: String, trim: true },

    // Personal / Contact
    phone: { type: String, required: true, trim: true },
    location: { type: String, trim: true }, // "City, State, Country"
    description: { type: String, trim: true }, // Short Bio
    photoUrl: { type: String, trim: true },
    meetingMode: {
      type: String,
      enum: ["Online", "Offline", "Both"],
      default: "Online"
    },

    role: { type: String, default: "alumni", enum: ["alumni"] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model("Alumni", alumniSchema);
