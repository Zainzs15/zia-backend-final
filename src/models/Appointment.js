import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    preferredDate: {
      type: String, // YYYY-MM-DD format
      required: true,
    },
    concern: {
      type: String,
      default: "",
      trim: true,
    },
    plan: {
      type: String,
      enum: ["basic", "premium", null],
      default: null,
    },
    patientNumber: {
      type: Number,
      required: true,
    },
    slotStart: {
      type: Date,
      required: true,
    },
    slotEnd: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for faster queries by date
appointmentSchema.index({ preferredDate: 1 });
appointmentSchema.index({ createdAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;

