const express = require("express");
const auth = require("../middleware/auth");
const Therapist = require("./models/therapist");
const Availability = require("../models/Availability");
const Session = require("../models/Session");
const { calculateAvailableSlots } = require("../utils/slotEngine");

const router = express.Router();

// Helper: default Mon-Fri 10:00 - 17:00 schedule
const getDefaultWeekly = () => [
  { day: "Monday", isActive: true, slots: [{ startTime: "10:00", endTime: "17:00" }] },
  { day: "Tuesday", isActive: true, slots: [{ startTime: "10:00", endTime: "17:00" }] },
  { day: "Wednesday", isActive: true, slots: [{ startTime: "10:00", endTime: "17:00" }] },
  { day: "Thursday", isActive: true, slots: [{ startTime: "10:00", endTime: "17:00" }] },
  { day: "Friday", isActive: true, slots: [{ startTime: "10:00", endTime: "17:00" }] },
  { day: "Saturday", isActive: false, slots: [] },
  { day: "Sunday", isActive: false, slots: [] },
];

// GET /api/availability/me (Protected - Get or initialize therapist schedule)
router.get("/me", auth, async (req, res) => {
  try {
    let availability = await Availability.findOne({ therapistId: req.therapist._id });
    if (!availability) {
      availability = await Availability.create({
        therapistId: req.therapist._id,
        weekly: getDefaultWeekly(),
        durations: [30, 45, 60, 90],
        timezone: "UTC",
      });
    }
    res.json({ availability });
  } catch (err) {
    console.error("Availability GET Error:", err);
    res.status(500).json({ message: "Server error fetching availability" });
  }
});

// POST /api/availability/me (Protected - Save availability)
router.post("/me", auth, async (req, res) => {
  const { weekly, overrides, durations, timezone } = req.body;
  try {
    const availability = await Availability.findOneAndUpdate(
      { therapistId: req.therapist._id },
      {
        therapistId: req.therapist._id,
        weekly: weekly || getDefaultWeekly(),
        overrides: overrides || [],
        durations: durations || [30, 45, 60, 90],
        timezone: timezone || "UTC",
      },
      { new: true, upsert: true }
    );
    res.json({ message: "Availability updated successfully", availability });
  } catch (err) {
    console.error("Availability Save Error:", err);
    res.status(500).json({ message: "Server error saving availability" });
  }
});

// GET /api/availability/:slug/slots (Public - Query available slots for booking)
router.get("/:slug/slots", async (req, res) => {
  const { slug } = req.params;
  const { date, duration = 60 } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date query parameter (YYYY-MM-DD) is required" });
  }

  try {
    const therapist = await Therapist.findOne({ slug });
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    let availability = await Availability.findOne({ therapistId: therapist._id });
    if (!availability) {
      availability = {
        weekly: getDefaultWeekly(),
        overrides: [],
        durations: [30, 45, 60, 90],
      };
    }

    const bookedSessions = await Session.find({
      therapistId: therapist._id,
      date,
      status: "confirmed",
    });

    const availableSlots = calculateAvailableSlots({
      availability,
      dateStr: date,
      duration: parseInt(duration, 10),
      bookedSessions,
    });

    res.json({
      therapistName: therapist.name,
      date,
      duration: parseInt(duration, 10),
      durations: availability.durations || [30, 45, 60, 90],
      availableSlots,
    });
  } catch (err) {
    console.error("Fetch Slots Error:", err);
    res.status(500).json({ message: "Server error calculating slots" });
  }
});

module.exports = router;
