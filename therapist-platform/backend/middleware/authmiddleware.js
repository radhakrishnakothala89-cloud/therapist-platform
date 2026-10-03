const jwt = require("jsonwebtoken");
const Therapist = require("./models/therapist");
const auth = async (req, res, next) => {
  try {
    // 1. Get header (format: "Bearer <token>")
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    // 2. Extract token
    const token = authHeader.replace("Bearer ", "").trim();

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find therapist from database (excluding password_hash)
    const therapist = await Therapist.findById(decoded.id).select("-password_hash");
    if (!therapist) {
      return res.status(401).json({ message: "Therapist not found or token invalid" });
    }

    // 5. Attach therapist to request object
    req.therapist = therapist;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};

module.exports = auth;