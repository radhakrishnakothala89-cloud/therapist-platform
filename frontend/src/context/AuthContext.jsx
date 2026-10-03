
import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Get saved token
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || "";
  });

  // Get saved therapist data
  const [therapist, setTherapist] = useState(() => {
    const savedTherapist = localStorage.getItem("therapist");

    try {
      return savedTherapist ? JSON.parse(savedTherapist) : null;
    } catch (error) {
      console.error("Invalid therapist data:", error);
      return null;
    }
  });

  // Loading state while checking session
  const [loading, setLoading] = useState(true);

  // Restore session when page is refreshed
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");

      // No token means user is not logged in
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/profile/me");

        console.log("Session restored:", response.data);

        if (response.data.therapist) {
          setTherapist(response.data.therapist);

          localStorage.setItem(
            "therapist",
            JSON.stringify(response.data.therapist)
          );
        }
      } catch (error) {
        console.error(
          "Session restore error:",
          error.response?.data || error.message
        );

        // Token is invalid or expired
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("therapist");

          setToken("");
          setTherapist(null);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login function
  const login = (authToken, therapistData) => {
    console.log("Login successful");

    // Save token
    localStorage.setItem("token", authToken);

    // Save therapist information
    localStorage.setItem(
      "therapist",
      JSON.stringify(therapistData)
    );

    // Update React state
    setToken(authToken);
    setTherapist(therapistData);

    setLoading(false);
  };

  // Logout function
  const logout = () => {
    console.log("Logging out...");

    // Remove saved data
    localStorage.removeItem("token");
    localStorage.removeItem("therapist");

    // Clear React state
    setToken("");
    setTherapist(null);

    setLoading(false);
  };

  // Update therapist information
  const updateTherapistData = (updatedTherapist) => {
    localStorage.setItem(
      "therapist",
      JSON.stringify(updatedTherapist)
    );

    setTherapist(updatedTherapist);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        therapist,
        login,
        logout,
        updateTherapistData,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

