import { Router } from "express";
import Appointment from "../models/Appointment.js";

const router = Router();

const CLINIC_START_HOUR = 19; // 7 PM
const CLINIC_END_HOUR = 22; // 10 PM
const SLOT_MINUTES = 15;

function getDateKey(dateString) {
  if (dateString) return dateString;
  const now = new Date();
  return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function getNextSlotForDate(dateKey) {
  // Coundt existing appointments for this date
  const existingCount = await Appointment.countDocuments({
    preferredDate: dateKey,
  });

  const totalSlotsPerDay =
    ((CLINIC_END_HOUR - CLINIC_START_HOUR) * 60) / SLOT_MINUTES;

  if (existingCount >= totalSlotsPerDay) {
    return null; // no more slots
  }

  const start = new Date(
    `${dateKey}T${String(CLINIC_START_HOUR).padStart(2, "0")}:00:00`
  );
  const slotStart = new Date(
    start.getTime() + existingCount * SLOT_MINUTES * 60 * 1000
  );
  const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);

  return {
    slotStart,
    slotEnd,
    patientNumber: existingCount + 1,
  };
}

// GET all appointments
router.get("/", async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: appointments });
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// GET appointments by date
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.find({ preferredDate: date })
      .sort({ slotStart: 1 })
      .lean();
    res.json({ data: appointments });
  } catch (err) {
    console.error("Error fetching appointments by date:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// GET single appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).lean();
    
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    res.json({ data: appointment });
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

// POST create new appointment
router.post("/", async (req, res) => {
  try {
    const { name, phone, preferredDate, concern, plan } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const dateKey = getDateKey(preferredDate);
    const nextSlot = await getNextSlotForDate(dateKey);

    if (!nextSlot) {
      return res.status(400).json({
        error: "No slots available between 7 PM and 10 PM for this date.",
      });
    }

    const { slotStart, slotEnd, patientNumber } = nextSlot;

    const appointment = new Appointment({
      name,
      phone,
      preferredDate: dateKey,
      concern: concern || "",
      plan: plan || null,
      patientNumber,
      slotStart,
      slotEnd,
      status: "pending",
    });

    const savedAppointment = await appointment.save();

    res.status(201).json({ data: savedAppointment });
  } catch (err) {
    console.error("Error creating appointment:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// PATCH update appointment status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status && !["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).lean();

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ data: appointment });
  } catch (err) {
    console.error("Error updating appointment:", err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// DELETE appointment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id).lean();

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully", data: appointment });
  } catch (err) {
    console.error("Error deleting appointment:", err);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;

