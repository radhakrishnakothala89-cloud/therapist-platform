const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    packageName: {
      type: String,
      enum: ["3 Sessions", "6 Sessions", "12 Sessions"],
      required: true,
    },
    totalSessions: { type: Number, required: true },
    sessionsRemaining: { type: Number, required: true },
    price: { type: Number, required: true },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "exhausted", "expired"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Package || mongoose.model("Package", packageSchema);
