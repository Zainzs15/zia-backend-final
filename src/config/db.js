import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI is not set. Skipping DB connection.");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // These options are recommended for Mongoose 6+
      // Remove deprecated options if using older versions
    });
    console.log("✅ MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

