import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const PublicProfile = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const res = await axiosInstance.get(`/profile/${slug}`);
        setTherapist(res.data.therapist);
      } catch (err) {
        setError("Therapist profile not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchTherapist();
  }, [slug]);

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading profile...</div>;
  if (error || !therapist) return <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: "50px auto", padding: 30, background: "#fff", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 20 }}>
        <h1 style={{ margin: 0, color: "#2d3748" }}>{therapist.name}</h1>
        <p style={{ color: "#718096", margin: "5px 0 0 0" }}>Certified Therapist</p>
      </div>

      <div style={{ marginTop: 25 }}>
        <h3>About</h3>
        <p style={{ lineHeight: 1.6, color: "#4a5568" }}>
          {therapist.bio || "No bio provided yet."}
        </p>
      </div>

      <div style={{ marginTop: 25 }}>
        <h3>Specializations</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {therapist.specializations?.length ? (
            therapist.specializations.map((spec, i) => (
              <span key={i} style={{ background: "#e2e8f0", padding: "6px 12px", borderRadius: 20, fontSize: 14 }}>
                {spec}
              </span>
            ))
          ) : (
            <p style={{ color: "#a0aec0" }}>None listed</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 25 }}>
        <h3>Languages</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {therapist.languages?.length ? (
            therapist.languages.map((lang, i) => (
              <span key={i} style={{ background: "#feebc8", color: "#7b341e", padding: "6px 12px", borderRadius: 20, fontSize: 14 }}>
                {lang}
              </span>
            ))
          ) : (
            <p style={{ color: "#a0aec0" }}>None listed</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <button style={{ padding: "14px 28px", background: "#3182ce", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, cursor: "pointer" }}>
          Book Appointment (Coming in Phase 2)
        </button>
      </div>
    </div>
  );
};

export default PublicProfile;
