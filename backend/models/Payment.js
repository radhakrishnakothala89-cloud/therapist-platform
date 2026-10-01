const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true, lowercase: true, trim: true },
    clientPhone: { type: String, default: "" },
    orderId: { type: String, required: true },
    paymentId: { type: String, default: "" },
    amount: { type: Number, required: true }, // In INR
    currency: { type: String, default: "INR" },
    itemType: {
      type: String,
      enum: ["single_session", "package"],
      required: true,
    },
    packageDetails: {
      packageId: String,
      name: String,
      sessions: Number,
      validityMonths: Number,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    invoiceNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
