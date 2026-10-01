const express = require("express");
const mongoose = require("mongoose");
const SessionNote = require("../models/SessionNote");

const router = express.Router();

// Helper to validate MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// =====================================================
// 1. THERAPIST - CREATE NOTE
// POST /api/notes
// =====================================================
router.post("/", async (req, res) => {
  try {
    const { session, therapist, client, note, type } = req.body;

    if (!therapist || !client || !note || !type) {
      return res.status(400).json({
        message: "therapist, client, note, and type are required",
      });
    }

    if (!isValidId(therapist) || !isValidId(client)) {
      return res.status(400).json({
        message: "Invalid therapist or client ID format",
      });
    }

    if (session && !isValidId(session)) {
      return res.status(400).json({
        message: "Invalid session ID format",
      });
    }

    if (!["private", "shared"].includes(type)) {
      return res.status(400).json({
        message: "Type must be either 'private' or 'shared'",
      });
    }

    const newNote = await SessionNote.create({
      session: session || null,
      therapist,
      client,
      note,
      type,
    });

    res.status(201).json({
      message: "Session note created successfully",
      note: newNote,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Failed to create session note" });
  }
});

// =====================================================
// 2. THERAPIST - GET NOTES (Private + Shared)
// GET /api/notes?therapist=...&client=...
// =====================================================
router.get("/", async (req, res) => {
  try {
    const { therapist, client } = req.query;

    if (!therapist) {
      return res.status(400).json({
        message: "Therapist ID is required",
      });
    }

    if (!isValidId(therapist)) {
      return res.status(400).json({
        message: "Invalid therapist ID format",
      });
    }

    const filter = { therapist };
    if (client && isValidId(client)) {
      filter.client = client;
    }

    // Therapist receives BOTH private and shared notes
    const notes = await SessionNote.find(filter).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Fetch therapist notes error:", error);
    res.status(500).json({ message: "Failed to fetch therapist notes" });
  }
});

// =====================================================
// 3. CLIENT - GET SHARED NOTES ONLY
// GET /api/client/notes?client=...
// Also aliases /api/notes/client?client=... for backwards compatibility
// =====================================================
const getClientSharedNotes = async (req, res) => {
  try {
    const { client } = req.query;

    if (!client) {
      return res.status(400).json({
        message: "Client ID is required",
      });
    }

    if (!isValidId(client)) {
      return res.status(400).json({
        message: "Invalid client ID format",
      });
    }

    /*
      SECURITY ENFORCEMENT:
      Only notes with type === "shared" are queried from MongoDB.
      Private notes NEVER reach application memory or response payloads.
    */
    const notes = await SessionNote.find({
      client: client,
      type: "shared",
    })
      .select("_id session therapist client note type createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Fetch client notes error:", error);
    res.status(500).json({ message: "Failed to fetch client notes" });
  }
};

// Registered on both endpoints to satisfy both URL patterns
router.get("/client", getClientSharedNotes);

module.exports = {
  notesRouter: router,
  getClientSharedNotes,
};