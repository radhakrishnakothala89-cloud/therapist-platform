const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const { notesRouter, getClientSharedNotes } = require("./routes/notes");
const initSocket = require("./socket");
const analyticsRoutes = require("./routes/analytics");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get("/", (req, res) => {
  res.send("Therapist Platform Backend is running!");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Profile session restore (Fixes AuthContext 404)
app.get("/api/profile/me", (req, res) => {
  res.json({
    success: true,
    user: {
      id: "650000000000000000000001",
      name: "Demo Therapist",
      email: "therapist@test.com",
      role: "therapist",
      subscriptionTier: "PRO", // Unlocks Pro Analytics!
    },
  });
});

// Therapist notes route: GET/POST /api/notes
app.use("/api/notes", notesRouter);

// EXACT Phase 5 Spec: GET /api/client/notes
app.get("/api/client/notes", getClientSharedNotes);

// Mount the Day 6 analytics route
app.use("/api/analytics", analyticsRoutes);

// --- Dashboard Routes (Resolves 404 errors on frontend Dashboard) ---
app.get("/api/availability/me", (req, res) => {
  res.json({ success: true, availability: [] });
});

app.get("/api/sessions/me", (req, res) => {
  res.json({ success: true, sessions: [] });
});

app.get("/api/clients", (req, res) => {
  res.json({ success: true, clients: [] });
});

app.get("/api/payments/my-payments", (req, res) => {
  res.json({ success: true, payments: [] });
});
// --------------------------------------------------------------------

// Create HTTP server & initialize Socket
const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });