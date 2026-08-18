/**
 * llmService.js
 *
 * The ONLY place in the backend that talks to the LLM. Its job is strictly
 * limited to understanding the user's request and decomposing it into
 * capability-labelled stages. It never invents tool names — see
 * recommendationEngine.js, which is responsible for turning capabilities
 * into real tools from the database.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are the task-analysis engine inside AIJukebox, a product that turns a
person's natural-language goal into a sequence of workflow stages, each
labelled with the AI capability required to complete it.

Rules:
- Output ONLY valid JSON. No markdown fences, no commentary, no preamble.
- Never name a specific AI tool or product. You only identify CAPABILITIES
  (e.g. "document summarization", "text to speech", "AI video generation").
  A separate system matches capabilities to real tools from a database.
- Use only these catalog capability labels (case-insensitively): document
  summarization, script generation, content generation, writing assistance,
  text to speech, speech to text, AI video generation, video editing, image
  generation, image editing, presentation generation, logo generation,
  website generation, code generation, translation, data analysis, music
  generation, automation, or tutoring. This prevents empty recommendations
  caused by capabilities that have no verified catalog entries.
- Break the task into as many or as few stages as the task genuinely needs.
  A simple request ("generate a logo") can be a single stage. A complex
  request ("turn a research paper into a video") should be broken into the
  real sequential sub-tasks required.
- Each stage must have a clear input and output so stages chain together
  (stage N's output should conceptually feed stage N+1's input).
- Infer constraints (pricing preference, need for API access, open-source
  preference) only when the user states or clearly implies them. Otherwise
  leave them null/absent.

Return JSON matching exactly this shape:
{
  "goal": string,
  "input": string,
  "output": string,
  "constraints": {
    "pricing": "free_preferred" | "no_preference" | null,
    "apiRequired": boolean | null,
    "openSourcePreferred": boolean | null
  },
  "stages": [
    {
      "name": string,
      "input": string,
      "output": string,
      "capability": string,
      "description": string
    }
  ]
}`;

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function contains(text, phrases) {
  return phrases.some((phrase) => text.includes(phrase));
}

function makeStage(name, input, output, capability, description) {
  return { name, input, output, capability, description };
}

// Used only when the configured provider is unavailable. It selects existing
// catalog capability labels and never selects, suggests, or fabricates tools.
export function analyzeTaskLocally(query) {
  const text = query.toLowerCase();
  const constraints = {
    pricing: contains(text, ["free", "no cost", "without paying", "budget"]) ? "free_preferred" : "no_preference",
    apiRequired: contains(text, [" api", "api ", "api-", "integrat"]),
    openSourcePreferred: contains(text, ["open source", "opensource"]),
  };

  let input = "brief";
  let output = "result";
  let stages;

  if (contains(text, ["pdf", "research paper", "research document"]) && contains(text, ["video", "film", "youtube"])) {
    input = "PDF";
    output = "video";
    stages = [
      makeStage("PDF → Summary", "PDF", "summary", "document summarization", "Extract the essential ideas and evidence."),
      makeStage("Summary → Script", "summary", "script", "script generation", "Turn the key ideas into a clear narrative."),
      makeStage("Script → Voice", "script", "voiceover", "text to speech", "Create natural narration for the script."),
      makeStage("Script + Voice → Video", "script + voiceover", "video", "ai video generation", "Assemble a finished educational video."),
    ];
  } else if (contains(text, ["presentation", "slide deck", "slides", "powerpoint"])) {
    input = contains(text, ["outline", "brief"]) ? "outline" : "topic";
    output = "presentation";
    stages = [makeStage("Outline → Presentation", input, "presentation", "presentation generation", "Build a polished, editable slide deck.")];
  } else if (contains(text, ["logo", "brand mark"])) {
    input = "brand brief";
    output = "logo";
    stages = [makeStage("Brand Brief → Logo", "brand brief", "logo", "logo generation", "Generate logo directions from your brand idea.")];
  } else if (contains(text, ["image", "illustration", "artwork", "poster"])) {
    input = "prompt";
    output = "image";
    stages = [makeStage("Prompt → Image", "prompt", "image", "image generation", "Create a visual from a detailed prompt.")];
  } else if (contains(text, ["text to voice", "text-to-speech", "voiceover", "narration", "text to speech"])) {
    input = "text";
    output = "audio";
    stages = [makeStage("Text → Voice", "text", "audio", "text to speech", "Create a natural-sounding voice track.")];
  } else if (contains(text, ["transcrib", "speech to text", "audio to text"])) {
    input = "audio";
    output = "transcript";
    stages = [makeStage("Audio → Transcript", "audio", "transcript", "speech to text", "Convert spoken audio into searchable text.")];
  } else if (contains(text, ["website", "landing page", "web app"])) {
    input = "product brief";
    output = "website";
    stages = [makeStage("Brief → Website", "product brief", "website", "website generation", "Create a working web presence from your idea.")];
  } else if (contains(text, ["code", "program", "software"])) {
    input = "requirements";
    output = "code";
    stages = [makeStage("Requirements → Code", "requirements", "code", "code generation", "Turn requirements into implementation-ready code.")];
  } else if (contains(text, ["music", "song", "jingle"])) {
    input = "prompt";
    output = "audio";
    stages = [makeStage("Prompt → Music", "prompt", "audio", "music generation", "Generate an original musical track.")];
  } else if (contains(text, ["translat", "localiz"])) {
    input = "source text";
    output = "translated text";
    stages = [makeStage("Source → Translation", "source text", "translated text", "translation", "Translate while retaining tone and intent.")];
  } else if (contains(text, ["spreadsheet", "csv", "dataset", "data analysis"])) {
    input = "data";
    output = "insights";
    stages = [makeStage("Data → Insights", "data", "insights", "data analysis", "Explore patterns and produce useful findings.")];
  } else {
    stages = [makeStage("Brief → Draft", "brief", "draft", "content generation", "Generate a strong first draft from your request.")];
  }

  return { goal: query, input, output, constraints, stages };
}

/**
 * Calls the Anthropic Messages API to analyze a user's task and produce a
 * structured intent + stage decomposition. Throws on any failure — callers
 * are responsible for turning that into a clean HTTP error response.
 */
export async function analyzeTaskWithLLM(query) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return analyzeTaskLocally(query);
  }

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";

  let response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `User request: """${query}"""\n\nReturn the JSON now.`,
          },
        ],
      }),
    });
  } catch (error) {
    console.warn(`[llm] request unavailable; using local task analysis (${error.message}).`);
    return analyzeTaskLocally(query);
  }

  if (!response.ok) {
    console.warn(`[llm] request failed (${response.status}); using local task analysis.`);
    return analyzeTaskLocally(query);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block) => block.type === "text");
  if (!textBlock?.text) {
    return analyzeTaskLocally(query);
  }

  const cleaned = stripCodeFences(textBlock.text);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.warn(`[llm] invalid JSON response; using local task analysis (${err.message}).`);
    return analyzeTaskLocally(query);
  }

  if (!Array.isArray(parsed.stages) || parsed.stages.length === 0) {
    return analyzeTaskLocally(query);
  }

  return parsed;
}
