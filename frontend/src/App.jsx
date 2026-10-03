
import React, { useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/therapist/Dashboard";
import TherapistNotes from "./pages/TherapistNotes";
import ClientNotes from "./pages/ClientNotes";
import AnalyticsDashboard from "./components/Analytics";
import Layout from "./components/Layout";
import Chat from "./components/Chat";

// Home route
function HomeRedirect() {
  const { token, loading } = useContext(AuthContext);

  // Wait until AuthContext checks localStorage
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  // Logged in → Dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Not logged in → Login
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* =========================
              HOME
          ========================= */}
          <Route
            path="/"
            element={<HomeRedirect />}
          />

          {/* =========================
              AUTHENTICATION
          ========================= */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              CLIENT NOTES
          ========================= */}
          <Route
            path="/client/notes"
            element={<ClientNotes />}
          />

          {/* =========================
              MAIN APPLICATION
          ========================= */}
          <Route element={<Layout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Chat */}
            <Route
              path="/chat"
              element={
                <Chat
                  currentUserId="650000000000000000000001"
                  recipientId="650000000000000000000002"
                  recipientName="Sarah (Client)"
                />
              }
            />

            {/* Therapist Notes */}
            <Route
              path="/therapist/notes"
              element={<TherapistNotes />}
            />

            {/* Analytics */}
            <Route
              path="/analytics"
              element={<AnalyticsDashboard />}
            />

          </Route>

          {/* =========================
              UNKNOWN URL
          ========================= */}
          <Route
            path="*"
            element={<HomeRedirect />}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
