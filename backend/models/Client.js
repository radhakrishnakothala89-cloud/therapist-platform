const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const clientSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    age: { type: Number },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Intake fields
    presentingConcern: { type: String, default: "" },
    history: { type: String, default: "" },
    consent: {
      given: { type: Boolean, default: false },
      timestamp: { type: Date },
    },
    // Private therapist notes
    notes: [noteSchema],
  },
  { timestamps: true }
);

// A therapist cannot have duplicate client records with the same email
clientSchema.index({ therapistId: 1, email: 1 }, { unique: true });

module.exports = mongoose.models.Client || mongoose.model("Client", clientSchema);
