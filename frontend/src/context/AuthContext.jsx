import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  console.log("🔥 NEW AUTH CONTEXT IS RUNNING");

  // Get saved token
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem("token");

    console.log(
      "🔑 Saved token:",
      savedToken ? "Token exists" : "No token"
    );

    return savedToken || "";
  });

  // Get saved therapist data
  const [therapist, setTherapist] = useState(() => {
    const savedTherapist = localStorage.getItem("therapist");

    console.log(
      "👤 Saved therapist:",
      savedTherapist ? savedTherapist : "No therapist"
    );

    try {
      return savedTherapist ? JSON.parse(savedTherapist) : null;
    } catch (error) {
      console.error("❌ Invalid therapist data:", error);

      localStorage.removeItem("therapist");

      return null;
    }
  });

  // Loading state
  const [loading, setLoading] = useState(true);

  // Restore session when page is refreshed
  useEffect(() => {
    console.log("🚀 AuthContext useEffect started");

    const restoreSession = async () => {
      const storedToken = localStorage.getItem("token");

      console.log(
        "🔍 Checking stored token:",
        storedToken ? "Token exists" : "No token"
      );

      // No token
      if (!storedToken) {
        console.log("⚠️ No token found. Stopping session restore.");

        setLoading(false);
        return;
      }

      try {
        console.log("🔄 Restoring session...");

        const response = await axiosInstance.get("/profile/me");

        console.log("✅ Profile response:", response.data);

        // Backend returns user
        const user = response.data.user;

        if (user) {
          console.log("✅ Therapist restored:", user);

          setTherapist(user);

          localStorage.setItem(
            "therapist",
            JSON.stringify(user)
          );
        } else {
          console.error("❌ No user data received from backend");

          setTherapist(null);
        }
      } catch (error) {
        console.error(
          "❌ Session restore error:",
          error.response?.data || error.message
        );

        console.error("Full error:", error);

        // Token expired or invalid
        if (error.response?.status === 401) {
          console.log("⚠️ Token expired or invalid.");

          localStorage.removeItem("token");
          localStorage.removeItem("therapist");

          setToken("");
          setTherapist(null);
        }
      } finally {
        console.log("🏁 Session restore finished");

        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const login = (authToken, therapistData) => {
    console.log("✅ Login successful");

    console.log("Token received:", authToken);
    console.log("Therapist data received:", therapistData);

    // Save token
    localStorage.setItem("token", authToken);

    // Save therapist
    localStorage.setItem(
      "therapist",
      JSON.stringify(therapistData)
    );

    // Update React state
    setToken(authToken);
    setTherapist(therapistData);

    setLoading(false);
  };

  // Logout
  const logout = () => {
    console.log("🚪 Logging out...");

    localStorage.removeItem("token");
    localStorage.removeItem("therapist");

    setToken("");
    setTherapist(null);

    setLoading(false);
  };

  // Update therapist information
  const updateTherapistData = (updatedTherapist) => {
    console.log(
      "✏️ Updating therapist:",
      updatedTherapist
    );

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