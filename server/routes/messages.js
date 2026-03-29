import express from "express";
import { authRequired } from "../middleware/auth.js";

import Message from "../models/Message.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";

const router = express.Router();

function normalizeId(v) {
  return v ? String(v) : "";
}

/* ================= SEND ================= */
router.post("/send", authRequired, async (req, res) => {
  try {
    const { content, alumniId, studentId } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "content is required" });
    }

    if (req.user.role === "student") {
      const toAlumniId = normalizeId(alumniId);
      if (!toAlumniId) return res.status(400).json({ message: "alumniId is required" });

      const message = await Message.create({
        studentId: req.user.id,
        alumniId: toAlumniId,
        senderRole: "student",
        content: String(content).trim(),
        readStudent: true,
        readAlumni: false,
      });

      return res.json({ message });
    }

    if (req.user.role === "alumni") {
      const toStudentId = normalizeId(studentId);
      if (!toStudentId) return res.status(400).json({ message: "studentId is required" });

      const message = await Message.create({
        studentId: toStudentId,
        alumniId: req.user.id,
        senderRole: "alumni",
        content: String(content).trim(),
        readStudent: false,
        readAlumni: true,
      });

      return res.json({ message });
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

/* ================= INBOX THREADS ================= */
router.get("/threads", authRequired, async (req, res) => {
  try {
    if (req.user.role === "student") {
      const messages = await Message.find({ studentId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();

      const alumniIds = [...new Set(messages.map((m) => normalizeId(m.alumniId)))].filter(Boolean);
      const alumniDocs = await Alumni.find({ _id: { $in: alumniIds } }).lean();
      const alumniById = Object.fromEntries(alumniDocs.map((a) => [normalizeId(a._id), a]));

      const threadByAlumni = new Map();
      for (const m of messages) {
        const otherId = normalizeId(m.alumniId);
        if (!threadByAlumni.has(otherId)) {
          const a = alumniById[otherId];
          threadByAlumni.set(otherId, {
            alumniId: otherId,
            alumniName: a?.name || "Alumni",
            alumniPhotoUrl: a?.photoUrl || null,
            lastMessage: m.content,
            lastMessageAt: m.createdAt,
            lastSenderRole: m.senderRole,
            unreadCount: 0,
          });
        }
        const t = threadByAlumni.get(otherId);
        if (!m.readStudent) t.unreadCount += 1;
      }

      return res.json({ threads: [...threadByAlumni.values()] });
    }

    if (req.user.role === "alumni") {
      const messages = await Message.find({ alumniId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();

      const studentIds = [...new Set(messages.map((m) => normalizeId(m.studentId)))].filter(Boolean);
      const studentDocs = await Student.find({ _id: { $in: studentIds } }).lean();
      const studentById = Object.fromEntries(studentDocs.map((s) => [normalizeId(s._id), s]));

      const threadByStudent = new Map();
      for (const m of messages) {
        const otherId = normalizeId(m.studentId);
        if (!threadByStudent.has(otherId)) {
          const s = studentById[otherId];
          threadByStudent.set(otherId, {
            studentId: otherId,
            studentName: s?.name || "Student",
            studentPhotoUrl: s?.photoUrl || null,
            lastMessage: m.content,
            lastMessageAt: m.createdAt,
            lastSenderRole: m.senderRole,
            unreadCount: 0,
          });
        }
        const t = threadByStudent.get(otherId);
        if (!m.readAlumni) t.unreadCount += 1;
      }

      return res.json({ threads: [...threadByStudent.values()] });
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.error("Threads error:", error);
    return res.status(500).json({ message: "Failed to load threads" });
  }
});

/* ================= THREAD MESSAGES ================= */
router.get("/thread/:otherId", authRequired, async (req, res) => {
  try {
    const otherId = normalizeId(req.params.otherId);

    if (req.user.role === "student") {
      if (!otherId) return res.status(400).json({ message: "otherId is required" });

      await Message.updateMany(
        { studentId: req.user.id, alumniId: otherId, readStudent: false },
        { $set: { readStudent: true } }
      );

      const messages = await Message.find({
        studentId: req.user.id,
        alumniId: otherId,
      })
        .sort({ createdAt: 1 })
        .lean();

      const a = await Alumni.findById(otherId).lean();

      return res.json({
        other: {
          alumniId: otherId,
          alumniName: a?.name || "Alumni",
          alumniPhotoUrl: a?.photoUrl || null,
        },
        messages,
      });
    }

    if (req.user.role === "alumni") {
      if (!otherId) return res.status(400).json({ message: "otherId is required" });

      await Message.updateMany(
        { alumniId: req.user.id, studentId: otherId, readAlumni: false },
        { $set: { readAlumni: true } }
      );

      const messages = await Message.find({
        alumniId: req.user.id,
        studentId: otherId,
      })
        .sort({ createdAt: 1 })
        .lean();

      const s = await Student.findById(otherId).lean();

      return res.json({
        other: {
          studentId: otherId,
          studentName: s?.name || "Student",
          studentPhotoUrl: s?.photoUrl || null,
        },
        messages,
      });
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.error("Thread error:", error);
    return res.status(500).json({ message: "Failed to load thread" });
  }
});

/* ================= HISTORY (FOR /history PAGE) ================= */
router.get("/history", authRequired, async (req, res) => {
  try {
    if (req.user.role === "student") {
      const messages = await Message.find({ studentId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const alumniIds = [...new Set(messages.map((m) => normalizeId(m.alumniId)))].filter(Boolean);
      const alumniDocs = await Alumni.find({ _id: { $in: alumniIds } }).lean();
      const alumniById = Object.fromEntries(alumniDocs.map((a) => [normalizeId(a._id), a]));

      const enriched = messages.map((m) => ({
        ...m,
        counterpartName: alumniById[normalizeId(m.alumniId)]?.name || "Alumni",
        counterpartPhotoUrl: alumniById[normalizeId(m.alumniId)]?.photoUrl || null,
        counterpartId: normalizeId(m.alumniId),
      }));

      return res.json({ messages: enriched });
    }

    if (req.user.role === "alumni") {
      const messages = await Message.find({ alumniId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const studentIds = [...new Set(messages.map((m) => normalizeId(m.studentId)))].filter(Boolean);
      const studentDocs = await Student.find({ _id: { $in: studentIds } }).lean();
      const studentById = Object.fromEntries(studentDocs.map((s) => [normalizeId(s._id), s]));

      const enriched = messages.map((m) => ({
        ...m,
        counterpartName: studentById[normalizeId(m.studentId)]?.name || "Student",
        counterpartPhotoUrl: studentById[normalizeId(m.studentId)]?.photoUrl || null,
        counterpartId: normalizeId(m.studentId),
      }));

      return res.json({ messages: enriched });
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    console.error("Message history error:", error);
    return res.status(500).json({ message: "Failed to load message history" });
  }
});

export default router;

