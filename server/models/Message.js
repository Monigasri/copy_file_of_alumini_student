import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    alumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumni",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
      index: true,
    },
    content: { type: String, required: true, trim: true },
    readStudent: { type: Boolean, default: false, index: true },
    readAlumni: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Message", messageSchema);

