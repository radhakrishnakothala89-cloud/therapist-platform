const express = require("express");
const auth = require("../middleware/auth");
const Therapist = require("./models/therapist");

const router = express.Router();

// ==========================================
// 1. GET /api/profile/me (Private - Logged in therapist only)
// ==========================================
router.get("/me", auth, async (req, res) => {
  res.json({
    therapist: req.therapist,
  });
});

// ==========================================
// 2. PUT /api/profile/me (Private - Update own profile)
// ==========================================
router.put("/me", auth, async (req, res) => {
  const { bio, specializations, languages } = req.body;

  try {
    const therapist = req.therapist;

    if (bio !== undefined) therapist.bio = bio;
    if (specializations !== undefined) therapist.specializations = specializations;
    if (languages !== undefined) therapist.languages = languages;

    await therapist.save();

    res.json({
      message: "Profile updated successfully",
      therapist,
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

// ==========================================
// 3. GET /api/profile/:slug (Public - For clients/visitors)
// ==========================================
router.get("/:slug", async (req, res) => {
  try {
    const therapist = await Therapist.findOne({ slug: req.params.slug }).select("-password_hash");

    if (!therapist) {
      return res.status(404).json({ message: "Therapist profile not found" });
    }

    res.json({ therapist });
  } catch (err) {
    console.error("Fetch Profile Error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

module.exports = router;