import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const Dashboard = () => {
  const { therapist, logout, updateTherapistData } = useContext(AuthContext);

  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [languages, setLanguages] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (therapist) {
      setBio(therapist.bio || "");
      setSpecializations(therapist.specializations?.join(", ") || "");
      setLanguages(therapist.languages?.join(", ") || "");
    }
  }, [therapist]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        bio,
        specializations: specializations.split(",").map((s) => s.trim()).filter(Boolean),
        languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      };

      const res = await axiosInstance.put("/profile/me", payload);
      updateTherapistData(res.data.therapist);
      setMessage("? Profile updated successfully!");
    } catch (err) {
      setMessage("? Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!therapist) return <div>Loading dashboard...</div>;

  const publicUrl = `${window.location.origin}/${therapist.slug}`;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 15 }}>
        <h2>Welcome, {therapist.name}</h2>
        <button onClick={logout} style={{ padding: "8px 16px", background: "#e53e3e", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      {/* Public Link Banner */}
      <div style={{ background: "#ebf8ff", border: "1px solid #bee3f8", padding: 15, borderRadius: 8, margin: "20px 0" }}>
        <strong>Your Branded Public URL:</strong>{" "}
        <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: "#2b6cb0", fontWeight: "bold" }}>
          {publicUrl}
        </a>
      </div>

      {/* Profile Edit Form */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: 25, borderRadius: 8 }}>
        <h3>Edit Profile Details</h3>
        {message && <p style={{ fontWeight: "bold" }}>{message}</p>}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>Bio</label>
            <textarea
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about your background and therapy approach..."
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 5 }}>Specializations (comma separated)</label>
            <input
              type="text"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              placeholder="e.g. CBT, Trauma, Anxiety"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 5 }}>Languages (comma separated)</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g. English, Hindi, Spanish"
              style={{ width: "100%", padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>

          <button type="submit" disabled={saving} style={{ padding: "10px 20px", background: "#319795", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
