import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read token and therapist from localStorage on initial load
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [therapist, setTherapist] = useState(() => {
    const saved = localStorage.getItem("therapist");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Restore session only once on page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await axiosInstance.get("/profile/me");
          if (res.data.therapist) {
            setTherapist(res.data.therapist);
            localStorage.setItem("therapist", JSON.stringify(res.data.therapist));
          }
        } catch (err) {
          console.error("Session restore note:", err.message);
          // Only clear if server explicitly rejects with 401
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = (authToken, therapistData) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("therapist", JSON.stringify(therapistData));
    setToken(authToken);
    setTherapist(therapistData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("therapist");
    setToken("");
    setTherapist(null);
    setLoading(false);
  };

  const updateTherapistData = (updated) => {
    localStorage.setItem("therapist", JSON.stringify(updated));
    setTherapist(updated);
  };

  return (
    <AuthContext.Provider
      value={{ therapist, token, login, logout, updateTherapistData, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
