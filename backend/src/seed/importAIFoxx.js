import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import toolsData from "./toolsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AIFOXX_PATH = path.resolve(
  __dirname,
  "../../data/aifoxx-tools.json"
);

const OUTPUT_PATH = path.resolve(
  __dirname,
  "../../data/aijukebox-tools-merged.json"
);

// ------------------------------------------------------------
// AIJukebox controlled capabilities
// ------------------------------------------------------------

const CAPABILITIES = [
  "document summarization",
  "script generation",
  "content generation",
  "writing assistance",
  "text to speech",
  "speech to text",
  "AI video generation",
  "video editing",
  "image generation",
  "image editing",
  "presentation generation",
  "logo generation",
  "website generation",
  "code generation",
  "translation",
  "data analysis",
  "music generation",
  "automation",
  "tutoring",
];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[-_/]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const CAPABILITY_ALIASES = {
  "pdf summarization": "document summarization",
  "text summarization": "document summarization",
  "slide generation": "presentation generation",
  "deck generation": "presentation generation",
  "text-to-image": "image generation",
  "text to image": "image generation",
  "ai video generation": "AI video generation",
  "video generation": "AI video generation",
  "text-to-video": "AI video generation",
  "text to video": "AI video generation",
  "voice generation": "text to speech",
  "voice synthesis": "text to speech",
  "tts": "text to speech",
  "transcription": "speech to text",
  "stt": "speech to text",
  "education": "tutoring",
  "research summarization": "research summarization",
  "research assistance": "research assistance",
  "audio editing": "audio editing",
};

function canonicalizeCapabilities(capabilities = []) {
  return [
    ...new Set(
      capabilities
        .map((capability) => {
          const normalized = normalize(capability);
          return CAPABILITY_ALIASES[normalized] || capability;
        })
        .filter(Boolean)
    ),
  ];
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function textOf(tool) {
  return normalize(
    [
      tool.name,
      tool.category,
      tool.subcategory,
      tool.description,
      ...(tool.tags || []),
      ...(tool.use_cases || []),
    ].join(" ")
  );
}

// ------------------------------------------------------------
// Capability detection
//
// IMPORTANT:
// We only assign capabilities from our controlled vocabulary.
// We do NOT invent new capability names.
// ------------------------------------------------------------

const capabilityRules = [
  {
    capability: "image editing",
    terms: [
      "image editing",
      "photo editing",
      "photo editor",
      "background removal",
      "background remover",
      "retouch",
      "image enhancer",
      "photo enhancer",
      "remove background",
    ],
  },

  {
    capability: "image generation",
    terms: [
      "image generation",
      "image generator",
      "text to image",
      "text-to-image",
      "ai art",
      "ai image",
      "image creation",
      "generating images",
    ],
  },

  {
    capability: "logo generation",
    terms: [
      "logo generation",
      "logo generator",
      "logo design",
      "brand logo",
      "logo creation",
    ],
  },

  {
    capability: "AI video generation",
    terms: [
      "video generation",
      "video generator",
      "text to video",
      "text-to-video",
      "ai video",
      "video creation",
      "generating videos",
    ],
  },

  {
    capability: "video editing",
    terms: [
      "video editing",
      "video editor",
      "edit videos",
      "video effects",
    ],
  },

  {
    capability: "text to speech",
    terms: [
      "text to speech",
      "text-to-speech",
      "tts",
      "voice generator",
      "voice generation",
      "ai voice",
      "voiceover",
      "voice over",
      "narration",
    ],
  },

  {
    capability: "speech to text",
    terms: [
      "speech to text",
      "speech-to-text",
      "stt",
      "transcription",
      "transcribe audio",
      "voice transcription",
    ],
  },

  {
    capability: "presentation generation",
    terms: [
      "presentation generation",
      "presentation generator",
      "slide generation",
      "slide generator",
      "ai presentations",
      "ai presentation",
      "deck generation",
      "pitch deck",
    ],
  },

  {
    capability: "website generation",
    terms: [
      "website generation",
      "website generator",
      "website builder",
      "ai website",
      "landing page generator",
      "landing page generation",
      "build websites",
      "create websites",
    ],
  },

  {
    capability: "code generation",
    terms: [
      "code generation",
      "code generator",
      "coding assistant",
      "programming assistant",
      "code completion",
      "generate code",
      "software development",
      "developer assistant",
    ],
  },

  {
    capability: "translation",
    terms: [
      "translation",
      "translator",
      "language translation",
      "machine translation",
      "localization",
      "translate",
    ],
  },

  {
    capability: "document summarization",
    terms: [
      "document summarization",
      "document summary",
      "pdf summarization",
      "summarize documents",
      "summarize pdf",
      "text summarization",
      "summarization",
    ],
  },

  {
    capability: "data analysis",
    terms: [
      "data analysis",
      "data analytics",
      "analyze data",
      "spreadsheet analysis",
      "csv analysis",
      "data visualization",
      "business analytics",
      "predictive analytics",
    ],
  },

  {
    capability: "music generation",
    terms: [
      "music generation",
      "music generator",
      "ai music",
      "song generation",
      "generate music",
      "music creation",
    ],
  },

 {
  capability: "automation",
  terms: [
    "workflow automation",
    "automate workflows",
    "automated workflows",
    "business automation",
    "marketing automation",
    "sales automation",
    "process automation",
    "task automation",
    "customer automation",
    "automation platform",
    "automation tool",
    "automation software",
    "workflow builder",
    "workflow automation platform",
  ],
},

  {
    capability: "tutoring",
    terms: [
      "ai tutor",
      "tutoring",
      "education",
      "homework help",
      "learning assistant",
      "study assistant",
      "exam preparation",
    ],
  },

  {
    capability: "writing assistance",
    terms: [
      "writing assistant",
      "writing assistance",
      "writing tool",
      "grammar",
      "proofreading",
      "editing writing",
      "rewrite",
      "rewriting",
    ],
  },

  {
    capability: "content generation",
    terms: [
      "content generation",
      "content generator",
      "content creation",
      "copywriting",
      "marketing content",
      "social media content",
      "blog generation",
      "article generation",
    ],
  },

  {
    capability: "script generation",
    terms: [
      "script generation",
      "script generator",
      "scriptwriting",
      "video scripts",
      "youtube scripts",
      "screenwriting",
    ],
  },
];

// ------------------------------------------------------------
// Detect capabilities
// ------------------------------------------------------------

function detectCapabilities(tool) {
  const text = textOf(tool);
  const capabilities = [];

  for (const rule of capabilityRules) {
    const matched = rule.terms.some((term) =>
      text.includes(normalize(term))
    );

    if (matched) {
      capabilities.push(rule.capability);
    }
  }

  return [...new Set(capabilities)];
}

// ------------------------------------------------------------
// Input type detection
// ------------------------------------------------------------

function detectInputTypes(tool, capabilities) {
  const text = textOf(tool);
  const inputs = [];

  if (
    capabilities.includes("image generation") ||
    capabilities.includes("logo generation") ||
    capabilities.includes("presentation generation") ||
    capabilities.includes("website generation") ||
    capabilities.includes("writing assistance") ||
    capabilities.includes("content generation") ||
    capabilities.includes("script generation") ||
    capabilities.includes("translation") ||
    capabilities.includes("document summarization") ||
    capabilities.includes("code generation") ||
    capabilities.includes("tutoring")
  ) {
    inputs.push("text");
  }

  if (
    capabilities.includes("image editing") ||
    text.includes("photo") ||
    text.includes("image editing")
  ) {
    inputs.push("image");
  }

  if (
    capabilities.includes("video editing") ||
    capabilities.includes("AI video generation")
  ) {
    inputs.push("video");
  }

  if (
    capabilities.includes("speech to text") ||
    capabilities.includes("text to speech")
  ) {
    inputs.push("audio");
  }

  if (
    capabilities.includes("data analysis") ||
    text.includes("spreadsheet") ||
    text.includes("csv")
  ) {
    inputs.push("csv", "spreadsheet");
  }

  if (
    capabilities.includes("document summarization") ||
    text.includes("pdf") ||
    text.includes("document")
  ) {
    inputs.push("document");
  }

  return [...new Set(inputs)];
}

// ------------------------------------------------------------
// Output type detection
// ------------------------------------------------------------

function detectOutputTypes(tool, capabilities) {
  const outputs = [];

  if (
    capabilities.includes("image generation") ||
    capabilities.includes("image editing") ||
    capabilities.includes("logo generation")
  ) {
    outputs.push("image");
  }

  if (
    capabilities.includes("AI video generation") ||
    capabilities.includes("video editing")
  ) {
    outputs.push("video");
  }

  if (
    capabilities.includes("text to speech") ||
    capabilities.includes("speech to text")
  ) {
    outputs.push("audio");
  }

  if (
    capabilities.includes("presentation generation")
  ) {
    outputs.push("presentation");
  }

  if (
    capabilities.includes("website generation")
  ) {
    outputs.push("website");
  }

  if (
    capabilities.includes("data analysis")
  ) {
    outputs.push("chart", "text");
  }

  if (
    capabilities.includes("document summarization") ||
    capabilities.includes("writing assistance") ||
    capabilities.includes("content generation") ||
    capabilities.includes("script generation") ||
    capabilities.includes("translation") ||
    capabilities.includes("code generation") ||
    capabilities.includes("tutoring")
  ) {
    outputs.push("text");
  }

  if (
    capabilities.includes("automation")
  ) {
    outputs.push("workflow");
  }

  return [...new Set(outputs)];
}

// ------------------------------------------------------------
// Pricing
// ------------------------------------------------------------

function normalizePricing(pricing) {
  const value = normalize(pricing);

  if (value.includes("free")) return "Free";
  if (value.includes("freemium")) return "Freemium";
  if (value.includes("paid")) return "Paid";

  return pricing || "Unknown";
}

function hasFreeTier(tool) {
  const pricing = normalizePricing(tool.pricing);

  return (
    pricing === "Free" ||
    pricing === "Freemium"
  );
}

// ------------------------------------------------------------
// API availability
// ------------------------------------------------------------

function hasApi(tool) {
  return toArray(tool.access_methods)
    .some((method) => normalize(method) === "api");
}

// ------------------------------------------------------------
// Open source
// ------------------------------------------------------------

function isOpenSource(tool) {
  const text = textOf(tool);

  return (
    text.includes("open source") ||
    text.includes("open-source") ||
    text.includes("self hosted") ||
    text.includes("self-hosted")
  );
}

// ------------------------------------------------------------
// Quality score
//
// We deliberately DON'T invent ratings.
// Imported tools receive a neutral baseline.
// ------------------------------------------------------------

function calculateQualityScore(tool) {
  let score = 70;

  if (tool.popular === true) score += 5;
  if (tool.featured === true) score += 3;
  if (tool.status === "active") score += 5;

  return Math.min(score, 90);
}

// ------------------------------------------------------------
// Convert one AIFOXX record
// ------------------------------------------------------------

function normalizeTool(tool) {
  if (!tool || tool.status !== "active") {
    return null;
  }

const capabilities = canonicalizeCapabilities(
  detectCapabilities(tool)
);

// Don't import tools that don't map to something AIJukebox
  // Don't import tools that don't map to something AIJukebox
  // actually understands.
  if (capabilities.length === 0) {
    return null;
  }

  const inputTypes = detectInputTypes(tool, capabilities);
  const outputTypes = detectOutputTypes(tool, capabilities);

  return {
    name: tool.name?.trim(),
    description: tool.description?.trim() || "",
    category: tool.category || tool.subcategory || "Other",

    capabilities,

    inputTypes,
    outputTypes,

    pricing: normalizePricing(tool.pricing),
    freeTier: hasFreeTier(tool),

    apiAvailable: hasApi(tool),

    openSource: isOpenSource(tool),

    // We don't have a trustworthy user rating in AIFOXX.
    rating: 0,

    qualityScore: calculateQualityScore(tool),

    tags: [
      ...toArray(tool.tags),
      ...toArray(tool.subcategory),
    ]
      .filter(Boolean)
      .map(String),

    officialWebsiteUrl: tool.url || null,

    // Provenance
    source: "AIFOXX",
    sourceId: tool.id,
    sourceSlug: tool.slug,
    sourceLastVerified: tool.last_verified || null,

    status: tool.status || "unknown",
  };
}

// ------------------------------------------------------------
// Deduplication
// ------------------------------------------------------------

function dedupeTools(tools) {
  const map = new Map();

  for (const tool of tools) {
    const key = normalize(tool.name);

    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, tool);
      continue;
    }

    // Existing AIJukebox tool wins over imported data.
    // This protects your manually curated entries.
  }

  return [...map.values()];
}

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

function main() {
  console.log("[AIFOXX] Reading source...");

  const raw = fs.readFileSync(AIFOXX_PATH, "utf8");
  const aifoxxTools = JSON.parse(raw);

  console.log(`[AIFOXX] Source tools: ${aifoxxTools.length}`);
  console.log(`[AIJukebox] Existing tools: ${toolsData.length}`);

  const imported = aifoxxTools
    .map(normalizeTool)
    .filter(Boolean);

  console.log(
    `[AIFOXX] Relevant tools after capability mapping: ${imported.length}`
  );

  // Existing catalog gets priority.
  const existing = toolsData.map((tool) => ({
  ...tool,

  capabilities: canonicalizeCapabilities(
    tool.capabilities || []
  ),

  source: "AIJukebox",
  status: "active",
}));
  const combined = dedupeTools([
    ...existing,
    ...imported,
  ]);

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(combined, null, 2),
    "utf8"
  );

  console.log(
    `[MERGE] Final catalog: ${combined.length} tools`
  );

  console.log(
    `[OUTPUT] ${OUTPUT_PATH}`
  );
}

main();