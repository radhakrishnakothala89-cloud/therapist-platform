const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET history between logged-in user and other user
router.get('/history/:otherUserId', async (req, res) => {
  try {
    const currentUserId = req.user.id; // from auth middleware
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;