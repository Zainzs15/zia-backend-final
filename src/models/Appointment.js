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
      type: String, // YYYY-MM-DDedrtrhrhgdgfdg
      required: true,
      index: true,
    },

    concern: {
      type: String,
      trim: true,
      default: "",
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
    timestamps: true,
  }
);

// helpful indexes
appointmentSchema.index({ preferredDate: 1, patientNumber: 1 });
appointmentSchema.index({ createdAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
