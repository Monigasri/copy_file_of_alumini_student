import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },
    // Profile fields used throughout the existing UI.
    profession: { type: String },
    company: { type: String },
    previousCompany: { type: String },
    previousCompanyExp: { type: Number },
    totalExperience: { type: Number },
    location: { type: String },
    about: { type: String },
    phone: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

export default mongoose.model("User", userSchema);

