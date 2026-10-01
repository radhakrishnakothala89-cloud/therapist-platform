import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const PACKAGES = [
  { id: "pkg_3", name: "3 Sessions", sessions: 3, price: 1600, validity: "Valid for 1 month", popular: false },
  { id: "pkg_6", name: "6 Sessions", sessions: 6, price: 3000, validity: "Valid for 3 months", popular: true },
  { id: "pkg_12", name: "12 Sessions", sessions: 12, price: 5500, validity: "Valid for 6 months", popular: false },
];

const PublicProfile = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab: "single" | "package"
  const [bookingMode, setBookingMode] = useState("single");

  // Booking Flow States
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Intake Form States
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [age, setAge] = useState("");
  const [presentingConcern, setPresentingConcern] = useState("");
  const [history, setHistory] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);

  // Package Purchase State
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Razorpay Checkout Modal State
  const [checkoutData, setCheckoutData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const fetchTherapist = async () => {
      try {
        const res = await axiosInstance.get(`/profile/${slug}`);
        setTherapist(res.data.therapist);
      } catch (err) {
        console.error("Therapist fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapist();
  }, [slug]);

  useEffect(() => {
    if (!slug || !date || bookingMode !== "single") return;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const res = await axiosInstance.get(`/availability/${slug}/slots?date=${date}&duration=${duration}`);
        setSlots(res.data.availableSlots || []);
      } catch (err) {
        console.error("Error loading slots", err);
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [slug, date, duration, bookingMode]);

  // Initiate Checkout for Single Session or Package
  const handleInitiatePayment = async (itemType, packageId = null) => {
    setBookingError("");

    if (itemType === "single_session") {
      if (!selectedSlot) {
        setBookingError("Please select a time slot first.");
        return;
      }
      if (!consentGiven) {
        setBookingError("You must agree to the informed consent to continue.");
        return;
      }
    } else {
      if (!clientName || !clientEmail) {
        setBookingError("Please provide your Name and Email to buy a package.");
        return;
      }
    }

    try {
      const res = await axiosInstance.post("/payments/create-order", {
        therapistSlug: slug,
        clientName,
        clientEmail,
        itemType,
        packageId,
      });

      setCheckoutData({
        ...res.data,
        itemType,
        packageId,
      });
    } catch (err) {
      setBookingError(err.response?.data?.message || "Failed to initiate payment");
    }
  };

  // Complete Razorpay Test Payment
  const handleConfirmTestPayment = async () => {
    setProcessingPayment(true);
    try {
      const payload = {
        paymentDbId: checkoutData.paymentDbId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        therapistSlug: slug,
        bookingDetails:
          checkoutData.itemType === "single_session"
            ? {
                date,
                startTime: selectedSlot.startTime,
                duration,
                age,
                presentingConcern,
                history,
                consentGiven,
                consentTimestamp: new Date().toISOString(),
              }
            : null,
      };

      const res = await axiosInstance.post("/payments/verify", payload);
      setPaymentSuccess(res.data);
      setCheckoutData(null);
    } catch (err) {
      setBookingError("Payment verification failed.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 50 }}>Loading profile...</div>;
  if (!therapist) return <div style={{ textAlign: "center", padding: 50, color: "red" }}>Therapist not found.</div>;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* Therapist Header */}
        <div style={profileHeaderStyle}>
          <h1 style={{ fontSize: "28px", color: "#111827", margin: 0, fontWeight: "900" }}>{therapist.name}</h1>
          <p style={{ color: "#6b7280", margin: "6px 0 0 0" }}>Certified Clinical Therapist</p>
          <p style={{ marginTop: "14px", color: "#374151", lineHeight: 1.6 }}>{therapist.bio || "Welcome to my private practice. Select a booking option below."}</p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
            {therapist.specializations?.map((s, i) => (
              <span key={i} style={badgeStyle}>{s}</span>
            ))}
          </div>
        </div>

        {/* BOOKING MODE SELECTOR */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => { setBookingMode("single"); setPaymentSuccess(null); }}
            style={bookingMode === "single" ? activeModeBtnStyle : modeBtnStyle}
          >
            ?? Book Single Session (?600)
          </button>
          <button
            onClick={() => { setBookingMode("package"); setPaymentSuccess(null); }}
            style={bookingMode === "package" ? activeModeBtnStyle : modeBtnStyle}
          >
            ?? Therapy Packages (Save up to 25%)
          </button>
        </div>

        {/* SUCCESS CONFIRMATION */}
        {paymentSuccess && (
          <div style={successCardStyle}>
            <h2 style={{ color: "#15803d", margin: "0 0 10px 0" }}>?? Payment & Booking Confirmed!</h2>
            <p style={{ color: "#374151" }}>Your payment was processed successfully in Razorpay Test Mode.</p>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "10px", margin: "20px 0", border: "1.5px solid #bbf7d0", textAlign: "left" }}>
              <p style={{ margin: "6px 0" }}><strong>Invoice Number:</strong> #{paymentSuccess.invoiceNumber}</p>
              <p style={{ margin: "6px 0" }}><strong>Status:</strong> <span style={{ color: "#166534", fontWeight: "700" }}>PAID</span></p>
              {paymentSuccess.session && (
                <>
                  <p style={{ margin: "6px 0" }}><strong>Session Date:</strong> {paymentSuccess.session.date}</p>
                  <p style={{ margin: "6px 0" }}><strong>Time:</strong> {paymentSuccess.session.startTime} - {paymentSuccess.session.endTime}</p>
                </>
              )}
              {paymentSuccess.package && (
                <>
                  <p style={{ margin: "6px 0" }}><strong>Package:</strong> {paymentSuccess.package.packageName}</p>
                  <p style={{ margin: "6px 0" }}><strong>Sessions Credited:</strong> {paymentSuccess.package.totalSessions} Sessions</p>
                  <p style={{ margin: "6px 0" }}><strong>Valid Until:</strong> {new Date(paymentSuccess.package.expiresAt).toLocaleDateString()}</p>
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <a
                href={`http://localhost:5000/api/payments/invoice/${paymentSuccess.paymentId}`}
                target="_blank"
                rel="noreferrer"
                style={{ padding: "12px 24px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "8px", textDecoration: "none", fontWeight: "700" }}
              >
                ?? View / Print Official Invoice
              </a>
              <button onClick={() => setPaymentSuccess(null)} style={{ padding: "12px 20px", background: "#f1f5f9", border: "1px solid #cbd5e0", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* OPTION A: PACKAGES VIEW */}
        {!paymentSuccess && bookingMode === "package" && (
          <div style={bookingCardStyle}>
            <h2 style={{ fontSize: "22px", color: "#111827", fontWeight: "900", marginBottom: "6px" }}>
              ?? Multi-Session Packages
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
              Discounted bundles valid across appointments with Dr. {therapist.name}.
            </p>

            {bookingError && <div style={errorStyle}>{bookingError}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  style={{
                    padding: "24px",
                    borderRadius: "12px",
                    border: selectedPackage?.id === pkg.id ? "2.5px solid #2563eb" : "1.5px solid #e2e8f0",
                    backgroundColor: selectedPackage?.id === pkg.id ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {pkg.popular && (
                    <span style={{ position: "absolute", top: "-10px", right: "16px", background: "#f59e0b", color: "#ffffff", padding: "2px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "800" }}>
                      MOST POPULAR
                    </span>
                  )}
                  <h3 style={{ margin: "0 0 8px 0", color: "#111827", fontSize: "18px" }}>{pkg.name}</h3>
                  <div style={{ fontSize: "26px", fontWeight: "900", color: "#2563eb", marginBottom: "6px" }}>?{pkg.price}</div>
                  <div style={{ color: "#6b7280", fontSize: "13px" }}>{pkg.validity}</div>
                </div>
              ))}
            </div>

            {selectedPackage && (
              <div style={{ borderTop: "1.5px solid #e2e8f0", paddingTop: "20px" }}>
                <h4 style={{ margin: "0 0 14px 0", color: "#111827" }}>Enter Contact Details for {selectedPackage.name} (?{selectedPackage.price})</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" required placeholder="John Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input type="email" required placeholder="john@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <button onClick={() => handleInitiatePayment("package", selectedPackage.id)} style={btnStyle}>
                  Proceed to Razorpay Checkout (?{selectedPackage.price})
                </button>
              </div>
            )}
          </div>
        )}

        {/* OPTION B: SINGLE SESSION BOOKING */}
        {!paymentSuccess && bookingMode === "single" && (
          <div style={bookingCardStyle}>
            <h2 style={{ fontSize: "22px", color: "#111827", fontWeight: "900", marginBottom: "20px" }}>
              ?? Book Appointment (?{SINGLE_SESSION_PRICE})
            </h2>

            {bookingError && <div style={errorStyle}>{bookingError}</div>}

            {/* 1. Duration */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>1. Duration:</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {[30, 45, 60, 90].map((d) => (
                  <button key={d} type="button" onClick={() => setDuration(d)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #2563eb", backgroundColor: duration === d ? "#2563eb" : "#ffffff", color: duration === d ? "#ffffff" : "#2563eb", fontWeight: "700", cursor: "pointer" }}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Date */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>2. Date:</label>
              <input type="date" min={new Date().toISOString().split("T")[0]} value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, width: "200px" }} />
            </div>

            {/* 3. Slot Grid */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>3. Time Slot:</label>
              {loadingSlots ? (
                <p style={{ color: "#6b7280" }}>Finding available slots...</p>
              ) : slots.length === 0 ? (
                <p style={{ color: "#ef4444" }}>No slots open on this date.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", marginTop: "10px" }}>
                  {slots.map((s, idx) => (
                    <button key={idx} type="button" onClick={() => setSelectedSlot(s)} style={{ padding: "10px", borderRadius: "8px", border: selectedSlot?.startTime === s.startTime ? "2px solid #2563eb" : "1px solid #cbd5e0", backgroundColor: selectedSlot?.startTime === s.startTime ? "#2563eb" : "#ffffff", color: selectedSlot?.startTime === s.startTime ? "#ffffff" : "#1f2937", fontWeight: "700", cursor: "pointer" }}>
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Intake & Checkout Button */}
            {selectedSlot && (
              <div style={{ borderTop: "1.5px solid #e2e8f0", paddingTop: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#111827", marginBottom: "14px" }}>
                  4. Client Intake ({selectedSlot.startTime} – {selectedSlot.endTime})
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input type="text" required placeholder="John Doe" value={clientName} onChange={(e) => setClientName(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Age *</label>
                    <input type="number" required placeholder="28" value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <input type="email" required placeholder="john@example.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number *</label>
                    <input type="tel" required placeholder="+91 9876543210" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Presenting Concern</label>
                  <textarea rows="2" placeholder="e.g. Dealing with stress, anxiety..." value={presentingConcern} onChange={(e) => setPresentingConcern(e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e0", marginBottom: "20px" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input type="checkbox" required checked={consentGiven} onChange={(e) => setConsentGiven(e.target.checked)} style={{ marginTop: "3px" }} />
                    <span>I consent to therapy services and agree to confidentiality and cancellation policies.</span>
                  </label>
                </div>
                <button type="button" onClick={() => handleInitiatePayment("single_session")} style={btnStyle}>
                  Proceed to Razorpay Checkout (?{SINGLE_SESSION_PRICE})
                </button>
              </div>
            )}
          </div>
        )}

        {/* RAZORPAY TEST PAYMENT MODAL */}
        {checkoutData && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <div style={{ textAlign: "center", borderBottom: "1.5px solid #e2e8f0", paddingBottom: "16px" }}>
                <span style={{ fontSize: "12px", background: "#dbeafe", color: "#1e40af", padding: "3px 10px", borderRadius: "12px", fontWeight: "800" }}>
                  RAZORPAY TEST MODE
                </span>
                <h3 style={{ margin: "10px 0 4px 0", color: "#111827", fontSize: "22px" }}>Dr. {therapist.name}</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{checkoutData.itemName}</p>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "#2563eb", marginTop: "12px" }}>
                  ?{checkoutData.amountInRupees}
                </div>
              </div>

              <div style={{ padding: "20px 0", color: "#374151", fontSize: "14px" }}>
                <p style={{ margin: "4px 0" }}><strong>Order ID:</strong> {checkoutData.orderId}</p>
                <p style={{ margin: "4px 0" }}><strong>Customer:</strong> {clientName} ({clientEmail})</p>
                <p style={{ margin: "14px 0 0 0", color: "#64748b", fontSize: "13px" }}>
                  ?? This is a simulated Razorpay checkout for development testing.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleConfirmTestPayment} disabled={processingPayment} style={btnStyle}>
                  {processingPayment ? "Processing..." : `Simulate Successful Payment (?${checkoutData.amountInRupees})`}
                </button>
                <button onClick={() => setCheckoutData(null)} style={{ padding: "12px", background: "#f1f5f9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const pageStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)", padding: "40px 20px", fontFamily: "sans-serif" };
const containerStyle = { maxWidth: "780px", margin: "0 auto" };
const profileHeaderStyle = { backgroundColor: "#ffffff", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", marginBottom: "20px" };
const bookingCardStyle = { backgroundColor: "#ffffff", padding: "30px", borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" };
const badgeStyle = { backgroundColor: "#e2e8f0", color: "#334155", padding: "6px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" };
const labelStyle = { color: "#1f2937", fontWeight: "700", fontSize: "14px", display: "block", marginBottom: "4px" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1.5px solid #cbd5e0", fontSize: "14px", boxSizing: "border-box" };
const btnStyle = { width: "100%", padding: "13px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "16px", cursor: "pointer" };
const errorStyle = { backgroundColor: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontWeight: "600", fontSize: "14px" };
const successCardStyle = { backgroundColor: "#f0fdf4", border: "1.5px solid #86efac", padding: "30px", borderRadius: "12px", textAlign: "center", marginBottom: "20px" };
const modeBtnStyle = { flex: 1, padding: "14px", borderRadius: "10px", border: "1.5px solid #cbd5e0", backgroundColor: "#ffffff", color: "#374151", fontWeight: "700", fontSize: "15px", cursor: "pointer" };
const activeModeBtnStyle = { ...modeBtnStyle, borderColor: "#2563eb", backgroundColor: "#2563eb", color: "#ffffff" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" };
const modalContentStyle = { backgroundColor: "#ffffff", width: "100%", maxWidth: "450px", borderRadius: "14px", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" };

export default PublicProfile;
