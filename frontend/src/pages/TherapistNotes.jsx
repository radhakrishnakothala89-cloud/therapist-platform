import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function TherapistNotes() {
  const [note, setNote] = useState("");
  const [type, setType] = useState("private");
  const [notesList, setNotesList] = useState([]);
  const [message, setMessage] = useState("");

  // 1. Get the authenticated therapist from AuthContext
  const { therapist } = useContext(AuthContext);

  // 2. Use real therapist ID if logged in, otherwise fallback for local testing
  const therapistId =
    therapist?._id ||
    localStorage.getItem("therapistId") ||
    "650c1f1e1c9d440000a1b2c3";

  const clientId =
    localStorage.getItem("clientId") ||
    "650c1f1e1c9d440000a1b2c4";

  // 3. Fetch both private and shared notes for this therapist
  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notes?therapist=${therapistId}&client=${clientId}`
      );
      const data = await response.json();
      if (response.ok) {
        setNotesList(data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [therapistId, clientId]);

  // 4. Submit new note
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapist: therapistId,
          client: clientId,
          note: note,
          type: type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create note");
        return;
      }

      setMessage("Note saved successfully!");
      setNote("");
      // Refresh list to display newly created note
      fetchNotes();
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to server");
    }
  };

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "850px",
        margin: "0 auto",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0" }}>
          Therapist Session Documentation
        </h2>
        {therapist && (
          <p style={{ color: "#4F46E5", fontWeight: "600", fontSize: "14px", margin: 0 }}>
            Logged in as: Dr. {therapist.name || therapist.email}
          </p>
        )}
      </div>

      {/* Modern Note Creation Form Card (Replaced the neon green) */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#1eb3d1",
          border: "1px solid #e6e5eb",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "600", color: "#374151" }}>
          Write Session Note
        </h3>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your clinical observations, diagnostic hypotheses, or shared action items..."
          rows="5"
          style={{
            width: "100%",
            padding: "14px",
            boxSizing: "border-box",
            borderRadius: "8px",
            border: "1px solid #D1D5DB",
            fontSize: "14px",
            lineHeight: "1.6",
            outline: "none",
            backgroundColor: "#F9FAFB",
            color: "#111827",
            fontFamily: "inherit",
          }}
          required
        />

        {/* Radio Option Selectors */}
        <div style={{ marginTop: "16px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "8px 14px",
              borderRadius: "8px",
              border: type === "private" ? "1px solid #F87171" : "1px solid #E5E7EB",
              backgroundColor: type === "private" ? "#FEF2F2" : "#FFFFFF",
              transition: "all 0.15s ease",
            }}
          >
            <input
              type="radio"
              value="private"
              checked={type === "private"}
              onChange={(e) => setType(e.target.value)}
            />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#991B1B" }}>
              🔒 Private (Only Therapist)
            </span>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              padding: "8px 14px",
              borderRadius: "8px",
              border: type === "shared" ? "1px solid #34D399" : "1px solid #E5E7EB",
              backgroundColor: type === "shared" ? "#ECFDF5" : "#FFFFFF",
              transition: "all 0.15s ease",
            }}
          >
            <input
              type="radio"
              value="shared"
              checked={type === "shared"}
              onChange={(e) => setType(e.target.value)}
            />
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#065F46" }}>
              👥 Shared (Therapist + Client)
            </span>
          </label>
        </div>

        {/* Modern Save Button */}
        <button
          type="submit"
          style={{
            marginTop: "18px",
            padding: "10px 22px",
            backgroundColor: "#4F46E5",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          Save Note
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <p
          style={{
            marginTop: "14px",
            fontWeight: "600",
            fontSize: "14px",
            color: message.includes("success") ? "#059669" : "#DC2626",
          }}
        >
          {message}
        </p>
      )}

      {/* Note History List */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", marginBottom: "16px" }}>
          Clinical Record (Private + Shared)
        </h3>
        {notesList.length === 0 ? (
          <p style={{ color: "#9CA3AF" }}>No notes recorded for this client yet.</p>
        ) : (
          notesList.map((item) => (
            <div
              key={item._id}
              style={{
                borderLeft: item.type === "private" ? "4px solid #EF4444" : "4px solid #10B981",
                backgroundColor: item.type === "private" ? "#FEF2F2" : "#F0FDF4",
                border: "1px solid #E5E7EB",
                borderLeftWidth: "4px",
                padding: "16px 20px",
                marginBottom: "12px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    backgroundColor: item.type === "private" ? "#FEE2E2" : "#D1FAE5",
                    color: item.type === "private" ? "#991B1B" : "#065F46",
                  }}
                >
                  {item.type === "private" ? "🔒 Private Note" : "👥 Shared with Client"}
                </span>
                <small style={{ color: "#9CA3AF", fontSize: "12px" }}>
                  {new Date(item.createdAt).toLocaleString()}
                </small>
              </div>
              <p style={{ margin: "5px 0", color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {item.note}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TherapistNotes