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
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Therapist Login</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={groupStyle}>
            <label>Email Address</label>
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
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 15 }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f4f6f8" };
const cardStyle = { background: "#fff", padding: 30, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: 400 };
const groupStyle = { marginBottom: 15, display: "flex", flexDirection: "column" };
const inputStyle = { padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc", marginTop: 5, fontSize: 14 };
const buttonStyle = { width: "100%", padding: "12px", background: "#3182ce", color: "#fff", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer", marginTop: 10 };
const errorStyle = { background: "#fed7d7", color: "#c53030", padding: 10, borderRadius: 6, marginBottom: 15, textAlign: "center" };

export default Login;
