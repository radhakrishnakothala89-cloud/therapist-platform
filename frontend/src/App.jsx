import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/therapist/Dashboard";
import TherapistNotes from "./pages/TherapistNotes";
import ClientNotes from "./pages/ClientNotes";
import AnalyticsDashboard from "./components/Analytics";
import Layout from "./components/Layout";
import Chat from "./components/Chat";

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
            element={<Navigate to="/dashboard" replace />}
          />

          {/* =========================
              LOGIN
          ========================= */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* =========================
              REGISTER
          ========================= */}
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
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;