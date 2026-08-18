import "dotenv/config";
import { connectDB } from "../config/db.js";
import Tool from "../models/Tool.js";
import toolsData from "./toolsData.js";
import mongoose from "mongoose";

async function run() {
  await connectDB({ required: true });

  console.log(`[seed] clearing existing tools...`);
  await Tool.deleteMany({});

  console.log(`[seed] inserting ${toolsData.length} tools...`);
  await Tool.insertMany(toolsData);

  console.log(`[seed] done. ${toolsData.length} tools in the catalog.`);
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
