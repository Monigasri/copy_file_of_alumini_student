import mongoose from "mongoose";

/**
 * SlotHistory model - stores history of appointment slots booked by students.
 * Records are added when an appointment is completed or rejected (moved from Appointment).
 */
const slotHistorySchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    alumniId: { type: mongoose.Schema.Types.ObjectId, ref: "Alumni", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ["approved", "rejected", "cancelled"], required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model("SlotHistory", slotHistorySchema);
