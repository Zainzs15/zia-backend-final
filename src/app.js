import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

// Ensure DB is connected (needed for Vercel serverless; no-op after first connect)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

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

// Avoid 404s for browser favicon requests (204 = no content, stops retries)
app.get("/favicon.ico", (_req, res) => res.status(204).end());
app.get("/favicon.png", (_req, res) => res.status(204).end());
app.get("/favicon", (_req, res) => res.status(204).end());

app.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    db: dbConnected ? "connected" : "disconnected",
    ...(dbConnected ? {} : { hint: "Set MONGO_URI in Vercel → Project → Settings → Environment Variables, then redeploy." }),
  });
});

app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
