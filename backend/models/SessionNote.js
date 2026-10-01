const mongoose = require("mongoose");

const sessionNoteSchema = new mongoose.Schema(
  {
    // session can be optional in case notes are taken outside a scheduled call
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: false,
    },

    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    note: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["private", "shared"],
      default: "private", // Default to private for clinical safety
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance index: speed up client note retrieval and therapist queries
sessionNoteSchema.index({ client: 1, type: 1 });
sessionNoteSchema.index({ therapist: 1 });

module.exports =
  mongoose.models.SessionNote ||
  mongoose.model("SessionNote", sessionNoteSchema);