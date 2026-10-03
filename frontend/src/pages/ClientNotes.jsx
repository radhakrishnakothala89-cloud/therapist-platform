import { useEffect, useState } from "react";

function ClientNotes() {
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // In production: const { user } = useAuth(); const clientId = user._id;
  const clientId = localStorage.getItem("clientId") || "650c1f1e1c9d440000a1b2c4";

  useEffect(() => {
    const getNotes = async () => {
      try {
        // Calls the exact Phase 5 route
        const response = await fetch(
          `http://localhost:5000/api/client/notes?client=${clientId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load notes");
          setLoading(false);
          return;
        }

        setNotes(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setMessage("Cannot connect to server");
        setLoading(false);
      }
    };

    getNotes();
  }, [clientId]);

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>My Shared Session Notes</h2>
      <p style={{ color: "#666" }}>
        Review summaries, action items, and resources shared with you by your therapist.
      </p>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {loading ? (
        <p>Loading your notes...</p>
      ) : notes.length === 0 ? (
        <div style={{ padding: "30px", background: "#5db8df", border: "1px dashed #ccc", textAlign: "center", borderRadius: "8px" }}>
          No shared notes available at this time.
        </div>
      ) : (
        notes.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #e1e8ed",
              borderLeft: "5px solid #27ae60",
              padding: "16px",
              marginBottom: "14px",
              borderRadius: "6px",
              backgroundColor: "#1eb3d1",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ fontSize: "16px", color: "#2c3e50", whiteSpace: "pre-wrap" }}>
              {item.note}
            </p>

            <small style={{ color: "#888", display: "block", marginTop: "10px" }}>
              Shared on: {new Date(item.createdAt).toLocaleDateString()} at{" "}
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default ClientNotes;