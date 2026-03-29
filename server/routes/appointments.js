import express from "express";
import Appointment from "../models/Appointment.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import SlotHistory from "../models/SlotHistory.js";
import { authRequired } from "../middleware/auth.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

/* ================= HELPER ================= */

async function toClientAppointment(doc) {
  const obj = doc.toObject
    ? doc.toObject({ versionKey: false })
    : doc;

  let alumniName = null;
  let studentData = null;

  if (obj.alumniId) {
    const alumni = await Alumni.findById(obj.alumniId).lean();
    alumniName = alumni?.name || null;
  }

  // 🔥 ADD THIS BLOCK
  if (obj.studentId) {
    const student = await Student.findById(obj.studentId)
      .select("-password")
      .lean();

    studentData = student || null;
  }

  return {
    id: obj._id.toString(),
    alumniId: obj.alumniId?.toString() || null,

    // 🔥 KEEP original studentId string
    studentId: obj.studentId?.toString() || null,

    // 🔥 ADD FULL STUDENT OBJECT
    student: studentData,

    date:
      obj.date instanceof Date
        ? obj.date.toISOString().slice(0, 10)
        : obj.date,

    time: obj.timeSlot,
    status: obj.status,
    bookedByName: obj.studentName || null,
    alumniName,
    rejectReason: obj.rejectReason || null,
    createdAt: obj.createdAt,
  };
}


async function recordSlotHistory(appointment, status) {
  if (!appointment.studentId) return;

  await SlotHistory.create({
    studentId: appointment.studentId,
    alumniId: appointment.alumniId,
    appointmentId: appointment._id,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
    status,
    completedAt: new Date(),
  });
}

/* ================= CREATE SLOT (ALUMNI) ================= */

router.post("/", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "alumni") {
      return res.status(403).json({
        message: "Only alumni can create slots",
      });
    }

    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        message: "date and time are required",
      });
    }

    const slotDateTime = new Date(`${date}T${time}`);
    if (slotDateTime <= new Date()) {
      return res.status(400).json({
        message: "Cannot create past slot",
      });
    }

    const appointment = await Appointment.create({
      alumniId: req.user.id,
      date: new Date(date),
      timeSlot: time,
      status: "available",
    });

    return res.status(201).json({
      appointment: await toClientAppointment(appointment),
    });
  } catch (error) {
    console.error("Create slot error:", error);
    return res.status(500).json({
      message: "Failed to create slot",
    });
  }
});

/* ================= GET APPOINTMENTS ================= */

router.get("/", authRequired, async (req, res) => {
  try {
    const { alumniId, history, slotHistory } = req.query;

    if (slotHistory === "true") {
      const query =
        req.user.role === "student"
          ? { studentId: req.user.id }
          : { alumniId: req.user.id };

      const records = await SlotHistory.find(query)
        .sort({ completedAt: -1 })
        .lean();

      return res.json({ slotHistory: records });
    }

    let query = {};

    if (history === "true") {
      query =
        req.user.role === "student"
          ? { studentId: req.user.id }
          : { alumniId: req.user.id, status: { $ne: "available" } };
    } else if (alumniId) {
      if (
        req.user.role === "alumni" &&
        String(alumniId) === String(req.user.id)
      ) {
        query = { alumniId: req.user.id };
      } else {
        query = { alumniId, status: "available" };
      }
    } else {
      return res.json({ appointments: [] });
    }

    // delete past available slots (strictly before today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await Appointment.deleteMany({
      status: "available",
      date: { $lt: startOfToday },
    });

    const appointments = await Appointment.find(query)
      .sort({ date: 1 })
      .lean();

    const finalList = await Promise.all(
      appointments.map((a) => toClientAppointment(a))
    );

    return res.json({ appointments: finalList });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({
      message: "Failed to load appointments",
    });
  }
});

/* ================= BOOK SLOT (STUDENT) ================= */

router.post("/book", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Only students can book",
      });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        message: "appointmentId is required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "available") {
      return res.status(400).json({
        message: "Slot not available",
      });
    }

    const slotDateTime = new Date(
      `${appointment.date.toISOString().slice(0, 10)}T${appointment.timeSlot}`
    );

    if (slotDateTime <= new Date()) {
      return res.status(400).json({
        message: "Cannot book past slot",
      });
    }

    const student = await Student.findById(req.user.id);

    appointment.studentId = req.user.id;
    appointment.studentName = student?.name || "";
    appointment.status = "booked";

    await appointment.save();


    // ✅ FETCH ALUMNI
    const alumni = await Alumni.findById(appointment.alumniId);

    // ✅ SEND EMAIL TO ALUMNI
    await sendEmail(
      alumni.email,
      "a new student has came for guidlence",
      `Hello ${alumni.name},

A new student has came for guidlence.

Student: ${student.name}

Date: ${appointment.date.toISOString().slice(0, 10)}
Time: ${appointment.timeSlot}

Please login to accept or reject.`
    );




    return res.json({
      appointment: await toClientAppointment(appointment),
    });
  } catch (error) {
    console.error("BOOK ERROR:", error);
    return res.status(500).json({
      message: "Failed to book appointment",
    });
  }
});

/* ================= CANCEL ================= */

router.post("/cancel", authRequired, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (
      appointment.studentId?.toString() !== req.user.id &&
      appointment.alumniId?.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (appointment.status === "booked") {
      await recordSlotHistory(appointment, "cancelled");
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.json({
      appointment: await toClientAppointment(appointment),
    });
  } catch (error) {
    console.error("Cancel error:", error);
    return res.status(500).json({ message: "Failed to cancel" });
  }
});

/* ================= REJECT ================= */

router.post("/reject", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "alumni") {
      return res.status(403).json({
        message: "Only alumni can reject",
      });
    }

    const { appointmentId, reason } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Slot not found" });
    }

    await recordSlotHistory(appointment, "rejected");

    appointment.status = "rejected";
    appointment.rejectReason = reason || null;
    await appointment.save();



    // ✅ GET STUDENT
    const student = await Student.findById(appointment.studentId);

    // ✅ EMAIL TO STUDENT
    await sendEmail(
      student.email,
      "sorry you slot has canced",
      `Hello ${student.name},

sorry you slot has canced.

Reason: ${reason || "Not specified"}

Date: ${appointment.date.toISOString().slice(0, 10)}
Time: ${appointment.timeSlot}`
    );



    return res.json({
      appointment: await toClientAppointment(appointment),
    });
  } catch (error) {
    console.error("Reject error:", error);
    return res.status(500).json({ message: "Failed to reject" });
  }
});

/* ================= COMPLETE ================= */

router.post("/complete", authRequired, async (req, res) => {
  try {
    if (req.user.role !== "alumni") {
      return res.status(403).json({
        message: "Only alumni can complete",
      });
    }

    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment || appointment.status !== "booked") {
      return res.status(400).json({
        message: "Only booked slots can be completed",
      });
    }

    await recordSlotHistory(appointment, "approved");

    appointment.status = "approved";
    await appointment.save();

    const student = await Student.findById(appointment.studentId);

    await sendEmail(
      student.email,
      "your slot has comfirmed",
      `Hello ${student.name},

your slot has comfirmed.

Date: ${appointment.date.toISOString().slice(0, 10)}
Time: ${appointment.timeSlot}`
    );

    return res.json({
      appointment: await toClientAppointment(appointment),
    });
  } catch (error) {
    console.error("Complete error:", error);
    return res.status(500).json({
      message: "Failed to complete",
    });
  }
});

export default router;


router.get("/test-email", async (req, res) => {
  try {
    console.log("🚀 TEST EMAIL ROUTE HIT");

    await sendEmail(
      "kubrii07@gmail.com",
      "TEST EMAIL",
      "If you receive this, email is working"
    );

    console.log("✅ Test email sent");
    res.send("Test email triggered");
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.send("Error");
  }
});