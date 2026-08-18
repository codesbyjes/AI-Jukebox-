import mongoose from "mongoose";

let isConnected = false;

export function isDatabaseAvailable() {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectDB({ required = false } = {}) {
  if (isConnected) return mongoose.connection;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const error = new Error("MONGODB_URI is not set. Add it to your .env file.");
    if (required) throw error;
    console.warn("[db] no MONGODB_URI set — running with the bundled tool catalog.");
    return null;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      // Keep failures fast; the API has a read-only bundled catalog fallback.
      serverSelectionTimeoutMS: 8000,
    });
  } catch (error) {
    if (required) throw error;
    console.warn(`[db] unavailable — running with the bundled tool catalog (${error.message}).`);
    return null;
  }

  isConnected = true;
  console.log(`[db] connected -> ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("[db] connection error:", err.message);
  });

  return mongoose.connection;
}
