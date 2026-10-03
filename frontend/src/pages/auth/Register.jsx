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
          ? formData.specializations.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        languages: formData.languages
          ? formData.languages.split(",").map((l) => l.trim()).filter(Boolean)
          : [],
      };

      await axiosInstance.post("/auth/register", payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Therapist Registration</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={groupStyle}>
            <label style={labelStyle}>Full Name</label>
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
            <label style={labelStyle}>Email Address</label>
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
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              name="password"
              required
              placeholder="Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Specializations (comma separated)</label>
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
            <label style={labelStyle}>Languages (comma separated)</label>
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
        <p style={{ textAlign: "center", marginTop: 22, color: "#4a5568", fontSize: "14px" }}>
          Already registered?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: "700", textDecoration: "none" }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #d20cb1 0%, #d20cb1 100%)",
  padding: "40px 20px",
};

const cardStyle = {
  backgroundColor: "#1eb3d1",
  padding: "40px 36px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "480px",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "26px",
  color: "#111827",
  fontWeight: "900",
  fontSize: "28px",
  letterSpacing: "-0.5px",
};

const groupStyle = {
  marginBottom: "18px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  color: "#1f2937",
  fontWeight: "700",
  fontSize: "14px",
  marginBottom: "8px",
};

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1.5px solid #cbd5e0",
  backgroundColor: "#ffffff",
  color: "#111827",
  fontSize: "15px",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "700",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
};

const errorStyle = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "18px",
  textAlign: "center",
  fontSize: "14px",
  fontWeight: "600",
};

export default Register;
