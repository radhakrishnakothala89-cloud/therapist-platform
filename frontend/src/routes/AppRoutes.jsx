
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/therapist/Dashboard";
import PublicProfile from "../pages/therapist/PublicProfile";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Branded public slug route: http://localhost:5173/:slug */}
      <Route path="/:slug" element={<PublicProfile />} />
    </Routes>
  );
};

export default AppRoutes;