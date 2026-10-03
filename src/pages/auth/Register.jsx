import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specializations: "",
    languages: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        specializations: formData.specializations
          ? formData.specializations.split(",").map((s) => s.trim())
          : [],
        languages: formData.languages
          ? formData.languages.split(",").map((l) => l.trim())
          : [],
      };

      await axiosInstance.post("/auth/register", payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Therapist Registration</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={groupStyle}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Dr. Sharma"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="sharma@gmail.com"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label>Specializations (comma separated)</label>
            <input
              type="text"
              name="specializations"
              placeholder="Anxiety, CBT, Depression"
              value={formData.specializations}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label>Languages (comma separated)</label>
            <input
              type="text"
              name="languages"
              placeholder="English, Hindi"
              value={formData.languages}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 15 }}>
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f4f6f8" };
const cardStyle = { background: "#fff", padding: 30, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: 450 };
const groupStyle = { marginBottom: 15, display: "flex", flexDirection: "column" };
const inputStyle = { padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc", marginTop: 5, fontSize: 14 };
const buttonStyle = { width: "100%", padding: "12px", background: "#3182ce", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer", marginTop: 10 };
const errorStyle = { background: "#fed7d7", color: "#c53030", padding: 10, borderRadius: 6, marginBottom: 15, textAlign: "center" };

export default Register;
