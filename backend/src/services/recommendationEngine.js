import Tool from "../models/Tool.js";
import toolsData from "../seed/toolsData.js";
import { isDatabaseAvailable } from "../config/db.js";

/**
 * recommendationEngine.js
 *
 * Turns a capability string + user constraints into a ranked list of REAL
 * tools pulled from MongoDB. The LLM never sees or picks tools directly —
 * it only produces the capability label; this module does the matching.
 */

const MAX_RESULTS_PER_STAGE = 10;
const MIN_RESULTS_TARGET = 5;

// Loose synonym map so "text to speech" also matches a tool tagged
// "tts" or "voice generation", etc. Extend as the catalog grows.
const CAPABILITY_SYNONYMS = {
  "document summarization": ["summarization", "pdf summarization", "text summarization"],
  "script generation": ["scriptwriting", "copywriting", "content generation"],
  "text to speech": ["tts", "voice generation", "voice synthesis", "narration"],
  "speech to text": ["stt", "transcription"],
  "ai video generation": ["video generation", "text-to-video", "video synthesis"],
  "image generation": ["text-to-image", "ai art generation"],
  "presentation generation": ["slide generation", "deck generation"],
  "logo generation": ["logo design", "brand identity generation"],
  "website generation": ["site builder", "landing page generation"],
  "code generation": ["coding assistant", "pair programming"],
  "translation": ["language translation", "localization"],
  "data analysis": ["analytics", "data visualization"],
};

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function expandCapability(capability) {
  const norm = normalize(capability);
  const synonyms = CAPABILITY_SYNONYMS[norm] || [];
  return [norm, ...synonyms.map(normalize)];
}

/**
 * Scores a single tool against the requested capability + constraints.
 * Returns { score (0-100), reasons: string[] }.
 */
function scoreTool(tool, capability, constraints = {}) {
  let score = 0;
  const reasons = [];

  const capabilityTerms = expandCapability(capability);
  const toolCapabilities = (tool.capabilities || []).map(normalize);
  const toolTags = (tool.tags || []).map(normalize);

  // Capability match (up to 40 points) — the single most important signal.
  const directMatch = toolCapabilities.some((c) => capabilityTerms.includes(c));
  const tagMatch = toolTags.some((t) => capabilityTerms.includes(t));
  if (directMatch) {
    score += 40;
    reasons.push("Matches the required capability");
  } else if (tagMatch) {
    score += 25;
    reasons.push("Closely related to the required capability");
  }

  // Quality / rating (up to 20 points).
  const qualityPoints = Math.round(((tool.qualityScore ?? 70) / 100) * 12);
  const ratingPoints = Math.round(((tool.rating ?? 4) / 5) * 8);
  score += qualityPoints + ratingPoints;
  if ((tool.rating ?? 0) >= 4.5) reasons.push("Highly rated by users");

  // Pricing preference (up to 15 points).
  if (constraints.pricing === "free_preferred") {
    if (tool.freeTier || tool.pricing === "Free" || tool.pricing === "Open Source") {
      score += 15;
      reasons.push("Free tier available");
    }
  } else {
    score += 8; // neutral baseline when the user has no stated preference
  }

  // API availability (up to 10 points).
  if (constraints.apiRequired) {
    if (tool.apiAvailable) {
      score += 10;
      reasons.push("API available");
    }
  } else if (tool.apiAvailable) {
    score += 4;
  }

  // Open source preference (up to 10 points).
  if (constraints.openSourcePreferred) {
    if (tool.openSource) {
      score += 10;
      reasons.push("Open source");
    }
  } else if (tool.openSource) {
    score += 3;
  }

  // Relevance nudge if the capability string appears in the description.
  if (normalize(tool.description).includes(normalize(capability))) {
    score += 5;
    reasons.push("Highly relevant to your request");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

/**
 * Finds and ranks real tools for a single workflow stage.
 * Never fabricates results — returns fewer than MIN_RESULTS_TARGET if
 * fewer genuinely relevant tools exist in the catalog.
 */
export async function recommendToolsForStage(capability, constraints = {}) {
  const capabilityTerms = expandCapability(capability);

  // Mongo is the source of truth when configured. The bundled catalog keeps
  // the demo fully usable before a developer has provisioned MongoDB.
  let candidates;
  if (isDatabaseAvailable()) {
    candidates = await Tool.find({
      $or: [
        { capabilities: { $in: capabilityTerms } },
        { tags: { $in: capabilityTerms } },
        { $text: { $search: capability } },
      ],
    }).limit(100);
  } else {
    candidates = toolsData
      .filter((tool) => {
        const terms = [...(tool.capabilities || []), ...(tool.tags || [])].map(normalize);
        return terms.some((term) => capabilityTerms.includes(term));
      })
      .map((tool) => ({ ...tool, _id: `catalog-${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` }));
  }

  const ranked = candidates
    .map((tool) => {
      const { score, reasons } = scoreTool(tool, capability, constraints);
      return { tool, score, reasons };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS_PER_STAGE);

  return ranked;
}

/**
 * Runs recommendation for every stage of a decomposed workflow.
 * Returns the stages enriched with ranked tool lists.
 */
export async function buildWorkflowRecommendations(stages, constraints = {}) {
  const enrichedStages = [];

  for (const [index, stage] of stages.entries()) {
    const recommended = await recommendToolsForStage(stage.capability, constraints);
    enrichedStages.push({
      order: index + 1,
      name: stage.name,
      input: stage.input,
      output: stage.output,
      capability: stage.capability,
      description: stage.description || "",
      recommendedTools: recommended.map((r, i) => ({
        tool: r.tool,
        score: r.score,
        reasons: r.reasons,
        bestMatch: i === 0 && r.score >= 60,
      })),
      resultCount: recommended.length,
      belowTarget: recommended.length < MIN_RESULTS_TARGET,
    });
  }

  return enrichedStages;
}
