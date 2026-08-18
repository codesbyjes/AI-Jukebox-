import { Router } from "express";
import { analyzeTaskWithLLM } from "../services/llmService.js";
import { buildWorkflowRecommendations } from "../services/recommendationEngine.js";
import Search from "../models/Search.js";
import Workflow from "../models/Workflow.js";
import { isDatabaseAvailable } from "../config/db.js";

const router = Router();

/**
 * POST /api/analyze-task
 * body: { query: string, clientId?: string }
 *
 * Full pipeline: LLM intent extraction -> task decomposition ->
 * tool search -> scoring -> workflow assembly -> persistence.
 * This is the single endpoint the frontend calls after the user presses
 * Enter on the search bar.
 */
router.post("/analyze-task", async (req, res) => {
  const { query, clientId } = req.body || {};

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "A non-empty 'query' string is required." });
  }
  if (query.length > 2000) {
    return res.status(400).json({ error: "Query is too long." });
  }

  try {
    // 1. LLM: understand intent + decompose into stages/capabilities.
    const intent = await analyzeTaskWithLLM(query.trim());

    // 2. DB + scoring: turn each stage's capability into ranked real tools.
    const stages = await buildWorkflowRecommendations(intent.stages, intent.constraints || {});

    // 3. Persist the workflow and the search entry (best-effort — a DB
    // hiccup here shouldn't block returning results to the user).
    let workflowDoc = null;
    if (isDatabaseAvailable()) {
      try {
      workflowDoc = await Workflow.create({
        query: query.trim(),
        clientId,
        goal: intent.goal,
        input: intent.input,
        output: intent.output,
        constraints: intent.constraints || {},
        stages: stages.map((s) => ({
          order: s.order,
          name: s.name,
          input: s.input,
          output: s.output,
          capability: s.capability,
          description: s.description,
          recommendedTools: s.recommendedTools.map((rt) => ({
            tool: rt.tool._id,
            score: rt.score,
            reasons: rt.reasons,
          })),
        })),
      });

      await Search.create({
        query: query.trim(),
        clientId,
        intent,
        workflowId: workflowDoc._id,
      });
      } catch (persistErr) {
        console.error("[analyze-task] persistence warning:", persistErr.message);
      }
    }

    return res.json({
      workflowId: workflowDoc?._id ?? null,
      query: query.trim(),
      goal: intent.goal,
      input: intent.input,
      output: intent.output,
      constraints: intent.constraints || {},
      stages,
    });
  } catch (err) {
    console.error("[analyze-task] error:", err.message);
    return res.status(502).json({
      error: "AIJukebox couldn't process that request. Please try again.",
    });
  }
});

/**
 * GET /api/workflows/:id
 * Reopen a previously generated workflow (used by "Recent Tasks").
 */
router.get("/workflows/:id", async (req, res) => {
  if (!isDatabaseAvailable()) {
    return res.status(404).json({ error: "Saved server workflows require a MongoDB connection." });
  }
  try {
    const workflow = await Workflow.findById(req.params.id).populate(
      "stages.recommendedTools.tool"
    );
    if (!workflow) return res.status(404).json({ error: "Workflow not found." });
    return res.json(workflow);
  } catch (err) {
    return res.status(400).json({ error: "Invalid workflow id." });
  }
});

export default router;
