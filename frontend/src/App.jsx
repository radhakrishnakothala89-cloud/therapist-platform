import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/therapist/Dashboard";
import TherapistNotes from "./pages/TherapistNotes";
import ClientNotes from "./pages/ClientNotes";
import AnalyticsDashboard from './components/Analytics';
import Layout from './components/Layout';
import Chat from './components/Chat';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Client-specific route */}
          <Route path="/client/notes" element={<ClientNotes />} />

          {/* Authenticated Therapist Layout (UNFAZED Wireframe) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/therapist/notes" element={<TherapistNotes />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;