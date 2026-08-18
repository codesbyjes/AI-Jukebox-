import { Router } from "express";
import Tool from "../models/Tool.js";
import { recommendToolsForStage } from "../services/recommendationEngine.js";
import toolsData from "../seed/toolsData.js";
import { isDatabaseAvailable } from "../config/db.js";

const router = Router();

// GET /api/tools?category=&pricing=&api=&openSource=&q=
router.get("/tools", async (req, res) => {
  const { category, pricing, api, openSource, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (pricing) filter.pricing = pricing;
  if (api === "true") filter.apiAvailable = true;
  if (openSource === "true") filter.openSource = true;
  if (q) filter.$text = { $search: q };

  try {
    let tools;
    if (isDatabaseAvailable()) {
      tools = await Tool.find(filter).limit(200).sort({ qualityScore: -1 });
    } else {
      const query = (q || "").toLowerCase();
      tools = toolsData
        .filter((tool) => {
          if (category && tool.category !== category) return false;
          if (pricing && tool.pricing !== pricing) return false;
          if (api === "true" && !tool.apiAvailable) return false;
          if (openSource === "true" && !tool.openSource) return false;
          if (query && !`${tool.name} ${tool.description} ${tool.tags.join(" ")}`.toLowerCase().includes(query)) return false;
          return true;
        })
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .map((tool) => ({ ...tool, _id: `catalog-${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }));
    }
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tools." });
  }
});

// GET /api/tools/:id
router.get("/tools/:id", async (req, res) => {
  try {
    if (!isDatabaseAvailable()) {
      const tool = toolsData.find(
        (item) => `catalog-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` === req.params.id
      );
      if (!tool) return res.status(404).json({ error: "Tool not found." });
      return res.json({ ...tool, _id: req.params.id });
    }
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ error: "Tool not found." });
    res.json(tool);
  } catch (err) {
    res.status(400).json({ error: "Invalid tool id." });
  }
});

// POST /api/recommend-tools  body: { capability, constraints }
// Standalone recommendation endpoint (used e.g. to refresh one stage
// without re-running the whole LLM analysis).
router.post("/recommend-tools", async (req, res) => {
  const { capability, constraints } = req.body || {};
  if (!capability) {
    return res.status(400).json({ error: "'capability' is required." });
  }
  try {
    const ranked = await recommendToolsForStage(capability, constraints || {});
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: "Failed to recommend tools." });
  }
});

export default router;
