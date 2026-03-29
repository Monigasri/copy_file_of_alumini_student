import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import { sendEmail } from "./sendEmail.js";

cron.schedule("*/10 * * * *", async () => {
  const now = new Date();

  const appointments = await Appointment.find({ status: "approved" });

  for (let appt of appointments) {
    const apptTime = new Date(
      `${appt.date.toISOString().slice(0, 10)}T${appt.timeSlot}`
    );

    const diff = apptTime - now;

    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const twoHours = 2 * oneHour;

    const student = await Student.findById(appt.studentId);
    const alumni = await Alumni.findById(appt.alumniId);

    // 1 DAY REMINDER
    if (diff < oneDay && diff > oneDay - 600000) {
      await sendEmail(student.email, "Reminder", "Meeting in 1 day");
      await sendEmail(alumni.email, "Reminder", "Meeting in 1 day");
    }

    // 1 HOUR REMINDER
    if (diff < oneHour && diff > oneHour - 600000) {
      await sendEmail(student.email, "Reminder", "Meeting in 1 hour");
      await sendEmail(alumni.email, "Reminder", "Meeting in 1 hour");
    }

    // 2 HOUR REMINDER
    if (diff < twoHours && diff > twoHours - 600000) {
      await sendEmail(student.email, "Reminder", "Meeting in 2 hours");
      await sendEmail(alumni.email, "Reminder", "Meeting in 2 hours");
    }
  }
});