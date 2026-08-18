import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./src/config/db.js";
import analyzeTaskRoutes from "./src/routes/analyzeTask.js";
import toolsRoutes from "./src/routes/tools.js";
import { notFoundHandler, errorHandler } from "./src/middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "aijukebox-backend" });
});

app.use("/api", analyzeTaskRoutes);
app.use("/api", toolsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    // MongoDB enriches persistence, but is intentionally not a prerequisite for
    // trying the product: recommendations can use the bundled real-tool catalog.
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[server] AIJukebox backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  }
}

start();
