import { Router } from "express";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";

const router = Router();

const JAZZCASH_TARGET_NUMBER = "0305-2654324";

// GET all payments
router.get("/", async (_req, res) => {
  try {
    const payments = await Payment.find()
      .populate("appointmentId", "name phone preferredDate patientNumber")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: payments });
  } catch (err) {
    console.error("Error fetching payments:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// GET payment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("appointmentId", "name phone preferredDate patientNumber")
      .lean();

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ data: payment });
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

// POST create new payment
router.post("/", async (req, res) => {
  try {
    const { amount, plan, name, phone, method, transactionId, appointmentId } =
      req.body || {};

    if (!amount || !plan || !method) {
      return res
        .status(400)
        .json({ error: "amount, plan and method are required" });
    }

    const supportedMethods = ["jazzcash", "sadapay", "nayapay", "credit", "debit"];

    if (!supportedMethods.includes(method)) {
      return res.status(400).json({ error: "Unsupported payment method" });
    }

    // Validate appointmentId if provided
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
    }

    // In a real app: call JazzCash / bank APIs here.
    // For this demo, we only *simulate* a transfer to the JazzCash number.

    const payment = new Payment({
      method,
      amount,
      plan,
      name: name || null,
      phone: phone || null,
      targetJazzCashNumber: JAZZCASH_TARGET_NUMBER,
      transactionId: transactionId || null,
      appointmentId: appointmentId || null,
      status: "pending", // In production, this would be updated after payment verification
    });

    const savedPayment = await payment.save();

    // Populate appointment if exists
    if (savedPayment.appointmentId) {
      await savedPayment.populate(
        "appointmentId",
        "name phone preferredDate patientNumber"
      );
    }

    res.status(201).json({
      status: "success",
      message:
        "Payment recorded. In production this is where money would be transferred.",
      data: savedPayment,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// PATCH update payment status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    if (
      status &&
      !["pending", "completed", "failed", "refunded"].includes(status)
    ) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (transactionId) updateData.transactionId = transactionId;

    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("appointmentId", "name phone preferredDate patientNumber")
      .lean();

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ data: payment });
  } catch (err) {
    console.error("Error updating payment:", err);
    res.status(500).json({ error: "Failed to update payment" });
  }
});

// DELETE payment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id).lean();

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully", data: payment });
  } catch (err) {
    console.error("Error deleting payment:", err);
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

export default router;

