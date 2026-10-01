const express = require("express");
const crypto = require("crypto");
const auth = require("../middleware/auth");
const Therapist = require("./models/therapist");
const Payment = require("../models/Payment");
const Package = require("../models/Package");
const Session = require("../models/Session");
const Client = require("../models/Client");

const router = express.Router();

// Supported Packages as per Specification
const PACKAGES = {
  pkg_3: { id: "pkg_3", name: "3 Sessions", sessions: 3, price: 1600, validityMonths: 1 },
  pkg_6: { id: "pkg_6", name: "6 Sessions", sessions: 6, price: 3000, validityMonths: 3 },
  pkg_12: { id: "pkg_12", name: "12 Sessions", sessions: 12, price: 5500, validityMonths: 6 },
};
const SINGLE_SESSION_PRICE = 600; // Flat single session fee in INR

// POST /api/payments/create-order (Public - Create Razorpay order)
router.post("/create-order", async (req, res) => {
  const { therapistSlug, clientName, clientEmail, itemType, packageId } = req.body;

  try {
    const therapist = await Therapist.findOne({ slug: therapistSlug });
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    let amount = SINGLE_SESSION_PRICE;
    let packageDetails = null;

    if (itemType === "package") {
      const selectedPkg = PACKAGES[packageId];
      if (!selectedPkg) {
        return res.status(400).json({ message: "Invalid package selected" });
      }
      amount = selectedPkg.price;
      packageDetails = selectedPkg;
    }

    // Generate Razorpay Order (Mock order ID if test keys are placeholders)
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = new Payment({
      therapistId: therapist._id,
      clientName,
      clientEmail,
      amount,
      currency: "INR",
      orderId,
      itemType,
      packageDetails,
      status: "created",
    });

    await payment.save();

    res.json({
      orderId,
      amount: amount * 100, // Amount in paise
      amountInRupees: amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKey123",
      paymentDbId: payment._id,
      therapistName: therapist.name,
      itemName: itemType === "package" ? `${packageDetails.name} Package` : "Therapy Session",
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// POST /api/payments/verify (Public - Verify payment & generate invoice)
router.post("/verify", async (req, res) => {
  const {
    paymentDbId,
    razorpay_payment_id,
    therapistSlug,
    bookingDetails,
  } = req.body;

  try {
    const payment = await Payment.findById(paymentDbId);
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const therapist = await Therapist.findById(payment.therapistId);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    // Mark Payment as Paid
    payment.status = "paid";
    payment.paymentId = razorpay_payment_id || `pay_mock_${Date.now()}`;
    payment.invoiceNumber = invoiceNumber;
    await payment.save();

    // 1. If Package: Credit Package and set Expiry
    let packageRecord = null;
    if (payment.itemType === "package") {
      const pkg = payment.packageDetails;
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + pkg.validityMonths);

      packageRecord = new Package({
        therapistId: therapist._id,
        clientName: payment.clientName,
        clientEmail: payment.clientEmail,
        packageName: pkg.name,
        totalSessions: pkg.sessions,
        sessionsRemaining: pkg.sessions,
        price: payment.amount,
        paymentId: payment._id,
        expiresAt,
        status: "active",
      });

      await packageRecord.save();

      // Upsert Client with Tag
      await Client.findOneAndUpdate(
        { therapistId: therapist._id, email: payment.clientEmail },
        {
          $set: { name: payment.clientName, email: payment.clientEmail, status: "Active" },
          $addToSet: { tags: "Package Holder" },
        },
        { upsert: true }
      );
    }

    // 2. If Single Session: Confirm Appointment
    let sessionRecord = null;
    if (payment.itemType === "single_session" && bookingDetails) {
      const { date, startTime, duration, notes, age, presentingConcern, history, consentGiven, consentTimestamp } = bookingDetails;

      const [hours, mins] = startTime.split(":").map(Number);
      const endMinutes = hours * 60 + mins + parseInt(duration, 10);
      const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

      sessionRecord = new Session({
        therapistId: therapist._id,
        clientName: payment.clientName,
        clientEmail: payment.clientEmail,
        date,
        startTime,
        endTime,
        startDateTime: new Date(`${date}T${startTime}:00Z`),
        endDateTime: new Date(`${date}T${endTime}:00Z`),
        duration: parseInt(duration, 10),
        notes: notes || "",
        status: "confirmed",
      });

      await sessionRecord.save();

      // Upsert Client with Intake & Consent
      await Client.findOneAndUpdate(
        { therapistId: therapist._id, email: payment.clientEmail },
        {
          $set: {
            name: payment.clientName,
            email: payment.clientEmail,
            age: age ? parseInt(age, 10) : undefined,
            presentingConcern: presentingConcern || "",
            history: history || "",
            consent: { given: !!consentGiven, timestamp: consentTimestamp ? new Date(consentTimestamp) : new Date() },
            status: "Active",
          },
          $addToSet: { tags: "New Client" },
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      message: "Payment verified successfully!",
      invoiceNumber: payment.invoiceNumber,
      paymentId: payment._id,
      itemType: payment.itemType,
      session: sessionRecord,
      package: packageRecord,
    });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

// GET /api/payments/my-payments (Protected - Therapist Dashboard Stats)
router.get("/my-payments", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ therapistId: req.therapist._id, status: "paid" }).sort({ createdAt: -1 });
    const packages = await Package.find({ therapistId: req.therapist._id }).sort({ createdAt: -1 });

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      payments,
      packages,
      stats: {
        totalRevenue,
        paidTransactions: payments.length,
        activePackages: packages.filter((p) => p.status === "active").length,
      },
    });
  } catch (err) {
    console.error("Fetch Payments Error:", err);
    res.status(500).json({ message: "Server error fetching payments" });
  }
});

// GET /api/payments/invoice/:id (Public - Printable Invoice Page)
router.get("/invoice/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("therapistId");
    if (!payment || payment.status !== "paid") {
      return res.status(404).send("Invoice not found or payment not completed.");
    }

    const therapist = payment.therapistId;
    const dateFormatted = new Date(payment.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const itemName = payment.itemType === "package" ? `${payment.packageDetails?.name} Therapy Package` : "Standard Therapy Session";

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${payment.invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background: #f8fafc; color: #1e293b; }
          .invoice-card { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; }
          .title { font-size: 28px; font-weight: 900; color: #0f172a; margin: 0; }
          .inv-num { font-size: 14px; color: #64748b; margin-top: 4px; }
          .details { display: flex; justify-content: space-between; margin: 30px 0; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 13px; text-transform: uppercase; color: #475569; }
          .table td { padding: 16px 12px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
          .total { text-align: right; margin-top: 24px; font-size: 20px; font-weight: 800; color: #0f172a; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; background: #dcfce7; color: #15803d; }
          .btn-print { margin-top: 30px; padding: 12px 24px; background: #2563eb; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }
          @media print { .btn-print { display: none; } body { background: #fff; padding: 0; } .invoice-card { box-shadow: none; padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div>
              <h1 class="title">INVOICE</h1>
              <div class="inv-num">Invoice #${payment.invoiceNumber}</div>
              <div style="margin-top: 8px;"><span class="status">PAID</span></div>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #0f172a;">${therapist.name}</h3>
              <p style="margin: 4px 0; color: #64748b; font-size: 14px;">Licensed Clinical Practice</p>
              <p style="margin: 2px 0; color: #64748b; font-size: 13px;">${therapist.email}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <p style="font-size: 13px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0;">Billed To:</p>
              <h4 style="margin: 0; font-size: 16px; color: #0f172a;">${payment.clientName}</h4>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">${payment.clientEmail}</p>
              ${payment.clientPhone ? `<p style="margin: 2px 0 0 0; color: #64748b; font-size: 13px;">${payment.clientPhone}</p>` : ""}
            </div>
            <div style="text-align: right;">
              <p style="font-size: 13px; color: #64748b; text-transform: uppercase; margin: 0 0 6px 0;">Invoice Date:</p>
              <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">${dateFormatted}</p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Transaction ID: ${payment.paymentId}</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${itemName}</strong></td>
                <td style="text-align: right;">?${payment.amount.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Paid: ?${payment.amount.toLocaleString("en-IN")}
          </div>

          <div style="text-align: center;">
            <button class="btn-print" onclick="window.print()">??? Print / Save as PDF</button>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error("Invoice Error:", err);
    res.status(500).send("Error rendering invoice");
  }
});

module.exports = router;
