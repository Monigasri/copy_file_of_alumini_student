import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumni",
      required: true,
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },

    // ✅ FIXED ENUM (added "booked")
    status: {
      type: String,
      enum: ["available", "booked", "approved", "rejected", "cancelled"],
      default: "available",
    },

    rejectReason: { type: String },
    studentName: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model("Appointment", appointmentSchema);
