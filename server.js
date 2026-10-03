const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
// 1. Destructure the router and client handler
const { notesRouter, getClientSharedNotes } = require("./routes/notes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Therapist Platform Backend is running!");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Therapist notes routes:
// POST /api/notes (Create note)
// GET  /api/notes?therapist=... (Therapist sees Private + Shared)
// GET  /api/notes/client?client=... (Backup client route)
app.use("/api/notes", notesRouter);

// Exact Phase 5 Spec:
// GET  /api/client/notes?client=... (Client sees ONLY Shared)
app.get("/api/client/notes", getClientSharedNotes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });