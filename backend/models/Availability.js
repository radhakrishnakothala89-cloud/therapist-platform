const mongoose = require("mongoose");

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // e.g. "10:00"
    endTime: { type: String, required: true },   // e.g. "17:00"
  },
  { _id: false }
);

const dayAvailabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    isActive: { type: Boolean, default: true },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const overrideSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD"
    isBlocked: { type: Boolean, default: false },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      unique: true,
    },
    timezone: { type: String, default: "UTC" },
    durations: {
      type: [Number],
      default: [30, 45, 60, 90], // Supported session durations in minutes
    },
    weekly: [dayAvailabilitySchema],
    overrides: [overrideSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Availability || mongoose.model("Availability", availabilitySchema);
