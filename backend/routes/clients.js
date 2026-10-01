const express = require("express");
const auth = require("../middleware/auth");
const Client = require("../models/Client");
const Session = require("../models/Session");

const router = express.Router();

// GET /api/clients (Protected - List, search, and filter clients)
router.get("/", auth, async (req, res) => {
  const { search, status, sortBy } = req.query;

  try {
    const query = { therapistId: req.therapist._id };

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    let clients = await Client.find(query).sort({ createdAt: -1 }).lean();

    // Attach lastSession and sessionCount for each client
    const clientEmails = clients.map((c) => c.email);
    const sessions = await Session.find({
      therapistId: req.therapist._id,
      clientEmail: { $in: clientEmails },
    }).sort({ startDateTime: -1 }).lean();

    const clientsWithStats = clients.map((client) => {
      const clientSessions = sessions.filter((s) => s.clientEmail === client.email);
      const lastSession = clientSessions[0] || null;
      return {
        ...client,
        totalSessions: clientSessions.length,
        lastSessionDate: lastSession ? `${lastSession.date} (${lastSession.startTime})` : "No sessions yet",
      };
    });

    // Custom sorting if requested
    if (sortBy === "name") {
      clientsWithStats.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json({ clients: clientsWithStats });
  } catch (err) {
    console.error("Fetch Clients Error:", err);
    res.status(500).json({ message: "Server error fetching clients" });
  }
});

// GET /api/clients/:id (Protected - Get single client details & session history)
router.get("/:id", auth, async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const sessionHistory = await Session.find({
      therapistId: req.therapist._id,
      clientEmail: client.email,
    }).sort({ startDateTime: -1 });

    res.json({ client, sessionHistory });
  } catch (err) {
    console.error("Fetch Client Error:", err);
    res.status(500).json({ message: "Server error fetching client details" });
  }
});

// PUT /api/clients/:id (Protected - Update status, tags)
router.put("/:id", auth, async (req, res) => {
  const { status, tags } = req.body;
  try {
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, therapistId: req.therapist._id },
      { $set: updateData },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client updated successfully", client });
  } catch (err) {
    console.error("Update Client Error:", err);
    res.status(500).json({ message: "Server error updating client" });
  }
});

// POST /api/clients/:id/notes (Protected - Add clinical note)
router.post("/:id/notes", auth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Note content is required" });
  }

  try {
    const client = await Client.findOne({
      _id: req.params.id,
      therapistId: req.therapist._id,
    });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.notes.unshift({ content: content.trim(), createdAt: new Date() });
    await client.save();

    res.json({ message: "Note added successfully", notes: client.notes });
  } catch (err) {
    console.error("Add Note Error:", err);
    res.status(500).json({ message: "Server error adding note" });
  }
});

module.exports = router;
