import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://www.ziahomeopethic.online",
    "https://ziahomeopethic.online",
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
  ].filter(Boolean),
  credentials: true,
};
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZIA Clinic API" });
});

app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ZIA Clinic backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
});

