import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import alumniRoutes from "./routes/alumni.js";
import userRoutes from "./routes/users.js";
import studentRoutes from "./routes/student.js";
import messageRoutes from "./routes/messages.js";
import "./utils/reminderJob.js";

// Always load the root .env (regardless of the current working directory).
dotenv.config({ path: new URL("../.env", import.meta.url) });

const app = express();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/appointment-details";

// Global middleware
app.use(
  cors({
    origin: "*",
    credentials: false,
  }),
);
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/messages", messageRoutes);


// Connect to MongoDB, then start the server.
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ API server listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  });

