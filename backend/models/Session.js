const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    clientPhone: { type: String, default: "" },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true },   // "11:00"
    startDateTime: { type: Date, required: true, index: true },
    endDateTime: { type: Date, required: true, index: true },
    duration: {
      type: Number,
      required: true,
      enum: [30, 45, 60, 90],
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
    notes: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true }
);

// Compound index for instant collision detection
sessionSchema.index({ therapistId: 1, startDateTime: 1, endDateTime: 1, status: 1 });

module.exports = mongoose.models.Session || mongoose.model("Session", sessionSchema);
