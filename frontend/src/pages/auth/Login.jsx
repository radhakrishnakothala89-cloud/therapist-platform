
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
      // Remove accidental spaces
      const cleanEmail = email.trim().toLowerCase();

      console.log("Sending login request...");
      console.log("Email:", cleanEmail);
      console.log("Password entered:", password ? "YES" : "NO");

      const res = await axiosInstance.post("/auth/login", {
        email: cleanEmail,
        password: password,
      });

      console.log("Login response:", res.data);

      if (!res.data.token) {
        throw new Error("Token was not returned by server");
      }

      login(
        res.data.token,
        res.data.therapist
      );

      navigate("/dashboard");

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      // Show exact backend message
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(
          err.response.data.errors
            .map((item) => item.msg)
            .join(", ")
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>

        <h2 style={titleStyle}>
          Therapist Login
        </h2>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div style={groupStyle}>
            <label style={labelStyle}>
              Email Address
            </label>

            <input
              type="email"
              required
              placeholder="sharma@gmail.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* PASSWORD */}

          <div style={groupStyle}>
            <label style={labelStyle}>
              Password
            </label>

            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              style={inputStyle}
            />
          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "#4a5568",
            fontSize: 14,
          }}
        >
          Don't have an account?{" "}

          <Link
            to="/register"
            style={{
              color: "#3182ce",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};

// ============================================================
// STYLES
// ============================================================

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#d20cb1",
};

const cardStyle = {
  background: "#1eb3d1",
  padding: "36px 32px",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  width: "100%",
  maxWidth: "420px",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "24px",
  color: "#1a202c",
  fontWeight: "800",
  fontSize: "26px",
  letterSpacing: "-0.5px",
};

const groupStyle = {
  marginBottom: "18px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  color: "#2d3748",
  fontWeight: "600",
  fontSize: "14px",
  marginBottom: "6px",
};

const inputStyle = {
  padding: "12px 14px",
  borderRadius: "6px",
  border: "1.5px solid #cbd5e0",
  backgroundColor: "#ffffff",
  color: "#1a202c",
  fontSize: "15px",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#3182ce",
  color: "#ffffff",
  fontWeight: "600",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
};

const errorStyle = {
  background: "#fed7d7",
  color: "#c53030",
  padding: "10px",
  borderRadius: "6px",
  marginBottom: "16px",
  textAlign: "center",
  fontSize: "14px",
};

export default Login;

