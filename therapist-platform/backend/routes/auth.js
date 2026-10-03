const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Therapist = require("../models/Therapist");

const router = express.Router();

// Helper to generate a URL-friendly slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// ==========================================
// STEP 4: POST /api/auth/register
// ==========================================
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    // 1. Validate data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, bio, specializations, languages } = req.body;

    try {
      // 2. Check if therapist email already exists
      const existingTherapist = await Therapist.findOne({ email });
      if (existingTherapist) {
        return res.status(400).json({ message: "Therapist with this email already exists" });
      }

      // 3. Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // 4. Generate unique slug
      let slug = generateSlug(name);
      const existingSlug = await Therapist.findOne({ slug });
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      // 5. Save Therapist
      const newTherapist = new Therapist({
        name,
        email,
        password_hash,
        slug,
        bio: bio || "",
        specializations: specializations || [],
        languages: languages || [],
      });

      await newTherapist.save();

      // 6. Return success
      res.status(201).json({
        message: "Therapist registered successfully",
        therapist: {
          id: newTherapist._id,
          name: newTherapist.name,
          email: newTherapist.email,
          slug: newTherapist.slug,
          bio: newTherapist.bio,
          specializations: newTherapist.specializations,
          languages: newTherapist.languages,
        },
      });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// ==========================================
// STEP 5: POST /api/auth/login
// ==========================================
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // 2. Find Therapist by email
      const therapist = await Therapist.findOne({ email });
      if (!therapist) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // 3. Compare password
      const isMatch = await bcrypt.compare(password, therapist.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // 4. Generate JWT
      const token = jwt.sign(
        { id: therapist._id, email: therapist.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 5. Return token and therapist info
      res.json({
        message: "Login successful",
        token,
        therapist: {
          id: therapist._id,
          name: therapist.name,
          email: therapist.email,
          slug: therapist.slug,
          bio: therapist.bio,
          specializations: therapist.specializations,
          languages: therapist.languages,
        },
      });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

console.log("AUTH ROUTES LOADED");
module.exports = router;