import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(mongodb+srv://ziaclinic:zia123456789@cluster0.67xeb5t.mongodb.net/zia-clinic?retryWrites=true&w=majority);
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
