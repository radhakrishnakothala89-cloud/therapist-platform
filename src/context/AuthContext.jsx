import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [therapist, setTherapist] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentTherapist = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get("/profile/me");
          setTherapist(res.data.therapist);
        } catch (err) {
          console.error("Failed to restore session:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentTherapist();
  }, [token]);

  const login = (authToken, therapistData) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setTherapist(therapistData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setTherapist(null);
  };

  const updateTherapistData = (updated) => {
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
