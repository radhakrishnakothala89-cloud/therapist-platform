
import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Dashboard = () => {
  const { therapist, logout, updateTherapistData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("payments"); // payments | clients | sessions | availability | profile

  // Profile State
  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [languages, setLanguages] = useState("");
  const [profileMsg, setProfileMsg] = useState("");

  // Availability State
  const [weekly, setWeekly] = useState([]);
  const [durations, setDurations] = useState([30, 45, 60, 90]);
  const [availMsg, setAvailMsg] = useState("");
  const [savingAvail, setSavingAvail] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState([]);

  // CRM State
  const [clients, setClients] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientStatusFilter, setClientStatusFilter] = useState("All");
  const [clientSort, setClientSort] = useState("recent");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSessionHistory, setClientSessionHistory] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");

  // Payments State
  const [payments, setPayments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [paymentStats, setPaymentStats] = useState({ totalRevenue: 0, paidTransactions: 0, activePackages: 0 });

  useEffect(() => {
    if (therapist) {
      setBio(therapist.bio || "");
      setSpecializations(therapist.specializations?.join(", ") || "");
      setLanguages(therapist.languages?.join(", ") || "");
      fetchAvailability();
      fetchSessions();
      fetchClients();
      fetchPayments();
    }
  }, [therapist]);

  const fetchAvailability = async () => {
    try {
      const res = await axiosInstance.get("/availability/me");
      if (res.data.availability) {
        setWeekly(res.data.availability.weekly || []);
        setDurations(res.data.availability.durations || [30, 45, 60, 90]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await axiosInstance.get("/sessions/me");
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axiosInstance.get("/clients");
      setClients(res.data.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axiosInstance.get("/payments/my-payments");
      setPayments(res.data.payments || []);
      setPackages(res.data.packages || []);
      setPaymentStats(res.data.stats || { totalRevenue: 0, paidTransactions: 0, activePackages: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const openClientProfile = async (client) => {
    try {
      const res = await axiosInstance.get(`/clients/${client._id}`);
      setSelectedClient(res.data.client);
      setClientSessionHistory(res.data.sessionHistory || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const res = await axiosInstance.post(`/clients/${selectedClient._id}/notes`, { content: newNote });
      setSelectedClient({ ...selectedClient, notes: res.data.notes });
      setNewNote("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim() || selectedClient.tags?.includes(newTag.trim())) return;
    const updatedTags = [...(selectedClient.tags || []), newTag.trim()];
    try {
      await axiosInstance.put(`/clients/${selectedClient._id}`, { tags: updatedTags });
      setSelectedClient({ ...selectedClient, tags: updatedTags });
      setNewTag("");
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = selectedClient.tags.filter((t) => t !== tagToRemove);
    try {
      await axiosInstance.put(`/clients/${selectedClient._id}`, { tags: updatedTags });
      setSelectedClient({ ...selectedClient, tags: updatedTags });
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const res = await axiosInstance.put("/profile/me", {
        bio,
        specializations: specializations.split(",").map((s) => s.trim()).filter(Boolean),
        languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      });
      updateTherapistData(res.data.therapist);
      setProfileMsg("✅ Profile updated successfully!");
    } catch (err) {
      setProfileMsg("❌ Failed to update profile");
    }
  };

  const handleDayToggle = (dayIndex) => {
    const updated = [...weekly];
    updated[dayIndex].isActive = !updated[dayIndex].isActive;
    if (updated[dayIndex].isActive && updated[dayIndex].slots.length === 0) {
      updated[dayIndex].slots = [{ startTime: "10:00", endTime: "17:00" }];
    }
    setWeekly(updated);
  };

  const handleSlotTimeChange = (dayIndex, field, value) => {
    const updated = [...weekly];
    updated[dayIndex].slots[0][field] = value;
    setWeekly(updated);
  };

  const handleSaveAvailability = async () => {
    setSavingAvail(true);
    setAvailMsg("");
    try {
      await axiosInstance.post("/availability/me", { weekly, durations });
      setAvailMsg("✅ Availability saved successfully!");
    } catch (err) {
      setAvailMsg("❌ Failed to save availability");
    } finally {
      setSavingAvail(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesStatus = clientStatusFilter === "All" || c.status === clientStatusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!therapist) return <div style={{ textAlign: "center", padding: 50 }}>Loading dashboard...</div>;

  const publicUrl = `${window.location.origin}/${therapist.slug}`;

  return (
    <div style={pageContainerStyle}>
      <div style={contentWrapperStyle}>

        {/* Header Bar */}
        <div style={headerCardStyle}>
          <div>
            <h2 style={{ color: "#111827", fontWeight: "900", margin: 0, fontSize: "24px" }}>Welcome, {therapist.name}</h2>
            <p style={{ color: "#6b7280", margin: "4px 0 0 0", fontSize: "14px" }}>Therapist Practice & Payments Portal</p>
          </div>
          <button onClick={logout} style={logoutButtonStyle}>Logout</button>
        </div>

        {/* Public Booking Link */}
        <div style={bannerStyle}>
          <span style={{ fontWeight: "700", color: "#1e40af" }}>🔗 Your Public Booking Link:</span>{" "}
          <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: "700" }}>
            {publicUrl}
          </a>
        </div>

        {/* Tabs Bar */}
        <div style={tabBarStyle}>
          <button onClick={() => setActiveTab("payments")} style={activeTab === "payments" ? activeTabStyle : tabStyle}>
            💳 Payments & Packages (₹{paymentStats.totalRevenue.toLocaleString()})
          </button>
          <button onClick={() => setActiveTab("clients")} style={activeTab === "clients" ? activeTabStyle : tabStyle}>
            👥 Clients CRM ({clients.length})
          </button>
          <button onClick={() => setActiveTab("sessions")} style={activeTab === "sessions" ? activeTabStyle : tabStyle}>
            📋 Booked Sessions ({sessions.length})
          </button>
          <button onClick={() => setActiveTab("availability")} style={activeTab === "availability" ? activeTabStyle : tabStyle}>
            🗓️ Working Hours
          </button>
          <button onClick={() => setActiveTab("profile")} style={activeTab === "profile" ? activeTabStyle : tabStyle}>
            👤 Profile
          </button>
        </div>

        {/* TAB 1: PAYMENTS & PACKAGES */}
        {activeTab === "payments" && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div style={statCardStyle}>
                <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: "700" }}>TOTAL REVENUE</div>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#166534", marginTop: "6px" }}>₹{paymentStats.totalRevenue.toLocaleString("en-IN")}</div>
              </div>
              <div style={statCardStyle}>
                <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: "700" }}>PAID TRANSACTIONS</div>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#2563eb", marginTop: "6px" }}>{paymentStats.paidTransactions}</div>
              </div>
              <div style={statCardStyle}>
                <div style={{ color: "#6b7280", fontSize: "13px", fontWeight: "700" }}>ACTIVE PACKAGES</div>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#9333ea", marginTop: "6px" }}>{paymentStats.activePackages}</div>
              </div>
            </div>

            {/* Active Packages Tracker */}
            <div style={{ ...cardStyle, marginBottom: "20px" }}>
              <h3 style={sectionHeadingStyle}>📦 Active Client Packages</h3>
              {packages.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No packages sold yet. Clients can purchase 3, 6, or 12 session packages from your public link.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {packages.map((pkg) => (
                    <div key={pkg._id} style={{ padding: "14px 18px", border: "1.5px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <strong>{pkg.clientName}</strong> ({pkg.clientEmail})
                        <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>Package: <strong>{pkg.packageName}</strong> (₹{pkg.price})</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#2563eb" }}>
                          {pkg.sessionsRemaining} / {pkg.totalSessions} Sessions Left
                        </div>
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                          Expires: {new Date(pkg.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div style={cardStyle}>
              <h3 style={sectionHeadingStyle}>🧾 Payment Transactions & Invoices</h3>
              {payments.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No payment transactions recorded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {payments.map((p) => (
                    <div key={p._id} style={{ padding: "14px 18px", border: "1.5px solid #e2e8f0", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "800", color: "#111827" }}>{p.clientName}</div>
                        <div style={{ color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>
                          {p.itemType === "package" ? `Package: ${p.packageDetails?.name}` : "Single Session"} | ID: {p.paymentId}
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: "12px", marginTop: "2px" }}>{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "18px", fontWeight: "900", color: "#166534" }}>₹{p.amount.toLocaleString()}</div>
                        <a
                          href={`http://localhost:5000/api/payments/invoice/${p._id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: "inline-block", marginTop: "6px", fontSize: "13px", color: "#2563eb", fontWeight: "700" }}
                        >
                          📄 Invoice #{p.invoiceNumber}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CLIENTS CRM */}
        {activeTab === "clients" && (
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={sectionHeadingStyle}>Client Directory</h3>
              <input type="text" placeholder="🔍 Search clients..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} style={{ ...inputStyle, width: "220px" }} />
            </div>

            {filteredClients.map((c) => (
              <div key={c._id} style={{ padding: "14px 18px", border: "1.5px solid #e2e8f0", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{c.name}</strong> ({c.email})
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    {c.tags?.map((t, idx) => (
                      <span key={idx} style={{ padding: "2px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "4px", fontSize: "12px", fontWeight: "600" }}>#{t}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => openClientProfile(c)} style={{ padding: "6px 14px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}>
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: CLIENT PROFILE */}
        {selectedClient && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "12px" }}>
                <div>
                  <h2 style={{ margin: 0, fontWeight: "900" }}>{selectedClient.name}</h2>
                  <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>{selectedClient.email} {selectedClient.age && `| Age: ${selectedClient.age}`}</p>
                </div>
                <button onClick={() => setSelectedClient(null)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ marginTop: "16px", padding: "14px", background: "#f8fafc", borderRadius: "8px" }}>
                <strong>Presenting Concern:</strong> {selectedClient.presentingConcern || "None specified"}<br />
                <span style={{ fontSize: "12px", color: "#166534" }}>✅ Consent Signed: {selectedClient.consent?.given ? "Yes" : "No"}</span>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={labelStyle}>Private Clinical Notes:</label>
                <form onSubmit={handleAddNote} style={{ display: "flex", gap: "8px", margin: "8px 0" }}>
                  <input type="text" placeholder="Add note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <button type="submit" style={btnPrimaryStyle}>Add</button>
                </form>
                {selectedClient.notes?.map((n, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: "#fffbeb", borderRadius: "6px", marginBottom: "6px", fontSize: "13px" }}>{n.content}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SESSIONS */}
        {activeTab === "sessions" && (
          <div style={cardStyle}>
            <h3 style={sectionHeadingStyle}>Booked Appointments</h3>
            {sessions.map((s) => (
              <div key={s._id} style={{ padding: "14px 18px", border: "1.5px solid #e2e8f0", borderRadius: "8px", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                <div><strong>{s.clientName}</strong> ({s.clientEmail})</div>
                <div style={{ textAlign: "right" }}>📅 {s.date} at {s.startTime} ({s.duration} min)</div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: AVAILABILITY */}
        {activeTab === "availability" && (
          <div style={cardStyle}>
            <h3 style={sectionHeadingStyle}>Weekly Working Hours</h3>
            {DAYS.map((d) => {
              const dayConfig = weekly.find((w) => w.day === d) || { day: d, isActive: false, slots: [{ startTime: "10:00", endTime: "17:00" }] };
              const dayIndex = weekly.findIndex((w) => w.day === d);
              return (
                <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
                  <div>
                    <input type="checkbox" checked={dayConfig.isActive} onChange={() => handleDayToggle(dayIndex)} /> <strong>{d}</strong>
                  </div>
                  {dayConfig.isActive && (
                    <div>
                      <input type="time" value={dayConfig.slots[0]?.startTime || "10:00"} onChange={(e) => handleSlotTimeChange(dayIndex, "startTime", e.target.value)} /> to <input type="time" value={dayConfig.slots[0]?.endTime || "17:00"} onChange={(e) => handleSlotTimeChange(dayIndex, "endTime", e.target.value)} />
                    </div>
                  )}
                </div>
              );
            })}
            <button onClick={handleSaveAvailability} style={{ ...btnPrimaryStyle, marginTop: "16px" }}>Save Working Hours</button>
          </div>
        )}

        {/* TAB 5: PROFILE */}
        {activeTab === "profile" && (
          <div style={cardStyle}>
            <h3 style={sectionHeadingStyle}>Edit Profile</h3>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: "12px" }}>
                <label style={labelStyle}>Bio</label>
                <textarea rows="4" value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <button type="submit" style={btnPrimaryStyle}>Save Profile</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

const pageContainerStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #e5349c 0%, #e5349c 100%)", padding: "40px 20px", fontFamily: "sans-serif" };
const contentWrapperStyle = { maxWidth: "880px", margin: "0 auto" };
const headerCardStyle = { backgroundColor: "#1eb3d1", padding: "24px 30px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const bannerStyle = { backgroundColor: "#eff6ff", border: "1.5px solid #bfdbfe", padding: "14px 20px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const tabBarStyle = { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" };
const tabStyle = { padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#ffffff", color: "#4b5563", fontWeight: "700", cursor: "pointer", fontSize: "14px" };
const activeTabStyle = { ...tabStyle, backgroundColor: "#2563eb", color: "#ffffff" };
const cardStyle = { backgroundColor: "#1eb3d1", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" };
const statCardStyle = { backgroundColor: "#ffffff", padding: "22px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" };
const sectionHeadingStyle = { color: "#111827", fontWeight: "900", fontSize: "18px", marginBottom: "16px" };
const labelStyle = { color: "#1f2937", fontWeight: "700", fontSize: "14px", display: "block", marginBottom: "4px" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1.5px solid #cbd5e0", fontSize: "14px", boxSizing: "border-box" };
const btnPrimaryStyle = { padding: "10px 20px", backgroundColor: "#2563eb", color: "#ffffff", fontWeight: "700", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "pointer" };
const logoutButtonStyle = { padding: "8px 16px", backgroundColor: "#dc2626", color: "#ffffff", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" };
const modalContentStyle = { backgroundColor: "#ffffff", width: "100%", maxWidth: "600px", borderRadius: "14px", padding: "28px" };

export default Dashboard;