import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      login(res.data.token, res.data.therapist);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Extra dark, thick heading */}
        <h2 style={titleStyle}>Therapist Login</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={groupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              required
              placeholder="sharma@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={groupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 22, color: "#4a5568", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#3182ce", fontWeight: "700", textDecoration: "none" }}>
            Register here
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
  background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  padding: "40px 36px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "420px",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "26px",
  color: "#111827",      // Deep solid black
  fontWeight: "900",     // Maximum thickness / bold
  fontSize: "28px",      // Large & clear
  letterSpacing: "-0.5px",
};

const groupStyle = {
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  color: "#1f2937",      // Dark charcoal
  fontWeight: "700",     // Bold label
  fontSize: "14px",
  marginBottom: "8px",
};

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1.5px solid #cbd5e0",
  backgroundColor: "#ffffff", // Pure white
  color: "#111827",           // Solid dark text
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

export default Login;
