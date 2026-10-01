const express = require("express");
const auth = require("../middleware/auth");
const Therapist = require("./models/therapist");
const Session = require("../models/Session");
const Client = require("../models/Client");
const { minutesToTime, timeToMinutes } = require("../utils/slotEngine");

const router = express.Router();

// POST /api/sessions/book (Public - Book appointment + Auto-sync Client Intake)
router.post("/book", async (req, res) => {
  const {
    therapistSlug,
    clientName,
    clientEmail,
    clientPhone,
    age,
    presentingConcern,
    history,
    consentGiven,
    consentTimestamp,
    date,
    startTime,
    duration,
    notes,
  } = req.body;

  if (!therapistSlug || !clientName || !clientEmail || !date || !startTime || !duration) {
    return res.status(400).json({ message: "Missing required booking details" });
  }

  try {
    const therapist = await Therapist.findOne({ slug: therapistSlug });
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + parseInt(duration, 10);
    const endTime = minutesToTime(endMinutes);

    const startDateTime = new Date(`${date}T${startTime}:00Z`);
    const endDateTime = new Date(`${date}T${endTime}:00Z`);

    // Double-Booking Collision Check
    const collision = await Session.findOne({
      therapistId: therapist._id,
      date,
      status: "confirmed",
      startDateTime: { $lt: endDateTime },
      endDateTime: { $gt: startDateTime },
    });

    if (collision) {
      return res.status(409).json({
        message: "This slot is no longer available. Please select another time.",
      });
    }

    // Save Confirmed Session
    const session = new Session({
      therapistId: therapist._id,
      clientName,
      clientEmail,
      clientPhone: clientPhone || "",
      date,
      startTime,
      endTime,
      startDateTime,
      endDateTime,
      duration: parseInt(duration, 10),
      notes: notes || "",
      status: "confirmed",
    });

    await session.save();

    // Auto-create or Update Client Record with Intake & Consent (checkbox + timestamp)
    await Client.findOneAndUpdate(
      { therapistId: therapist._id, email: clientEmail.toLowerCase().trim() },
      {
        $set: {
          therapistId: therapist._id,
          name: clientName.trim(),
          email: clientEmail.toLowerCase().trim(),
          phone: clientPhone || "",
          age: age ? parseInt(age, 10) : undefined,
          presentingConcern: presentingConcern || "",
          history: history || "",
          consent: {
            given: !!consentGiven,
            timestamp: consentTimestamp ? new Date(consentTimestamp) : new Date(),
          },
          status: "Active",
        },
        $setOnInsert: {
          tags: ["New Client"],
          notes: [],
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Appointment booked successfully!",
      session,
    });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ message: "Server error booking appointment" });
  }
});

// GET /api/sessions/me (Protected - Therapist gets their appointments)
router.get("/me", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ therapistId: req.therapist._id }).sort({ startDateTime: 1 });
    res.json({ sessions });
  } catch (err) {
    console.error("Fetch Sessions Error:", err);
    res.status(500).json({ message: "Server error fetching sessions" });
  }
});

// PATCH /api/sessions/:id/cancel (Protected - Cancel appointment)
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.therapist._id },
      { status: "cancelled" },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    res.json({ message: "Session cancelled", session });
  } catch (err) {
    res.status(500).json({ message: "Server error cancelling session" });
  }
});

module.exports = router;
