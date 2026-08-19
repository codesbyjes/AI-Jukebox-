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

Classify the request before decomposing it. A request is valid only when it
describes a meaningful, actionable goal involving creation, transformation,
research, analysis, planning, or finding a tool. Greetings, names, isolated
numbers, random words, and vague nonsense are invalid. Never force an invalid
request into a default workflow.

Return JSON matching exactly this shape:
{
  "valid": boolean,
  "confidence": number,
  "goal": string,
  "intent": string,
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

const ACTION_WORDS = ["create", "make", "turn", "convert", "build", "generate", "find", "summarize", "analyze", "research", "plan", "design", "edit", "transcrib", "translate", "organize", "prepare", "develop"];
const TASK_TERMS = ["paper", "research", "lecture", "notes", "flashcard", "quiz", "presentation", "slide", "video", "youtube", "podcast", "voice", "audio", "image", "logo", "brand", "website", "landing page", "campaign", "event", "business", "pitch", "marketing", "social media", "data", "spreadsheet", "csv", "dataset", "code", "program", "music", "song", "document", "pdf", "tool", "artificial intelligence", "ai "];

function hasActionableIntent(text) {
  const hasAction = ACTION_WORDS.some((word) => text.includes(word));
  const hasTaskTerm = TASK_TERMS.some((term) => text.includes(term));
  const words = text.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words);
  return hasAction && hasTaskTerm && words.length >= 3 && uniqueWords.size >= 3;
}

function invalidAnalysis(query) {
  return { valid: false, confidence: 0, goal: null, intent: null, input: null, output: null, constraints: {}, stages: [], query };
}

// Used only when the configured provider is unavailable. It selects existing
// catalog capability labels and never selects, suggests, or fabricates tools.
export function analyzeTaskLocally(query) {
  const text = query.toLowerCase();
  if (!hasActionableIntent(text)) return invalidAnalysis(query);
  const constraints = {
    pricing: contains(text, ["free", "no cost", "without paying", "budget"]) ? "free_preferred" : "no_preference",
    apiRequired: contains(text, [" api", "api ", "api-", "integrat"]),
    openSourcePreferred: contains(text, ["open source", "opensource"]),
  };

  let input = "brief";
  let output = "result";
  let stages;
  let intent = "task_creation";

  if (contains(text, ["pdf", "research paper", "research document"]) && contains(text, ["video", "film", "youtube"])) {
    intent = "content_transformation";
    input = "PDF";
    output = "video";
    stages = [
      makeStage("PDF → Summary", "PDF", "summary", "document summarization", "Extract the essential ideas and evidence."),
      makeStage("Summary → Script", "summary", "script", "script generation", "Turn the key ideas into a clear narrative."),
      makeStage("Script → Voice", "script", "voiceover", "text to speech", "Create natural narration for the script."),
      makeStage("Script + Voice → Video", "script + voiceover", "video", "ai video generation", "Assemble a finished educational video."),
    ];
  } else if (contains(text, ["presentation", "slide deck", "slides", "powerpoint"])) {
    intent = "presentation_generation";
    input = contains(text, ["outline", "brief"]) ? "outline" : "topic";
    output = "presentation";
    stages = [makeStage("Outline → Presentation", input, "presentation", "presentation generation", "Build a polished, editable slide deck.")];
  } else if (contains(text, ["logo", "brand mark"])) {
    intent = "brand_design";
    input = "brand brief";
    output = "logo";
    stages = [makeStage("Brand Brief → Logo", "brand brief", "logo", "logo generation", "Generate logo directions from your brand idea.")];
  } else if (contains(text, ["image", "illustration", "artwork", "poster"])) {
    intent = "image_creation";
    input = "prompt";
    output = "image";
    stages = [makeStage("Prompt → Image", "prompt", "image", "image generation", "Create a visual from a detailed prompt.")];
  } else if (contains(text, ["text to voice", "text-to-speech", "voiceover", "narration", "text to speech"])) {
    intent = "audio_creation";
    input = "text";
    output = "audio";
    stages = [makeStage("Text → Voice", "text", "audio", "text to speech", "Create a natural-sounding voice track.")];
  } else if (contains(text, ["transcrib", "speech to text", "audio to text"])) {
    intent = "transcription";
    input = "audio";
    output = "transcript";
    stages = [makeStage("Audio → Transcript", "audio", "transcript", "speech to text", "Convert spoken audio into searchable text.")];
  } else if (contains(text, ["website", "landing page", "web app"])) {
    intent = "website_generation";
    input = "product brief";
    output = "website";
    stages = [makeStage("Brief → Website", "product brief", "website", "website generation", "Create a working web presence from your idea.")];
  } else if (contains(text, ["code", "program", "software"])) {
    intent = "code_generation";
    input = "requirements";
    output = "code";
    stages = [makeStage("Requirements → Code", "requirements", "code", "code generation", "Turn requirements into implementation-ready code.")];
  } else if (contains(text, ["music", "song", "jingle"])) {
    intent = "music_generation";
    input = "prompt";
    output = "audio";
    stages = [makeStage("Prompt → Music", "prompt", "audio", "music generation", "Generate an original musical track.")];
  } else if (contains(text, ["translat", "localiz"])) {
    intent = "translation";
    input = "source text";
    output = "translated text";
    stages = [makeStage("Source → Translation", "source text", "translated text", "translation", "Translate while retaining tone and intent.")];
  } else if (contains(text, ["spreadsheet", "csv", "dataset", "data analysis"])) {
    intent = "data_analysis";
    input = "data";
    output = "insights";
    stages = [makeStage("Data → Insights", "data", "insights", "data analysis", "Explore patterns and produce useful findings.")];
  } else {
    if (contains(text, ["video", "film", "youtube"])) {
      intent = "video_editing";
      input = "source video";
      output = "edited video";
      stages = [makeStage("Source → Edit", "source video", "edited video", "video editing", "Assemble a polished edited video.")];
    } else if (contains(text, ["campaign", "social media", "marketing", "college event"])) {
      intent = "campaign_planning";
      input = "campaign brief";
      output = "campaign assets";
      stages = [makeStage("Brief → Plan", "campaign brief", "campaign plan", "content generation", "Shape the campaign strategy."), makeStage("Plan → Assets", "campaign plan", "campaign assets", "content generation", "Create the campaign content."), makeStage("Assets → Schedule", "campaign assets", "publishing schedule", "automation", "Organize the launch sequence.")];
    } else if (contains(text, ["flashcard", "quiz", "study guide", "lecture notes"])) {
      intent = "learning_support";
      input = "learning notes";
      output = "study materials";
      stages = [makeStage("Notes → Structure", "learning notes", "structured content", "document summarization", "Organize the learning material."), makeStage("Structure → Study Guide", "structured content", "study guide", "tutoring", "Create a clear study guide."), makeStage("Study Guide → Quiz", "study guide", "quiz", "tutoring", "Generate practice questions."), makeStage("Quiz → Flashcards", "quiz", "flashcards", "content generation", "Create recall-focused flashcards.")];
    } else if (contains(text, ["tool", "tools"]) && contains(text, ["find", "recommend", "need"])) {
      intent = "tool_discovery";
      input = "tool request";
      output = "recommended tools";
      stages = [makeStage("Goal → Criteria", "tool request", "selection criteria", "writing assistance", "Clarify what the tools must do."), makeStage("Criteria → Tools", "selection criteria", "recommended tools", "data analysis", "Compare suitable tools from the catalog.")];
    } else {
      return invalidAnalysis(query);
    }
  }

  return { valid: true, confidence: 0.92, goal: query, intent, input, output, constraints, stages };
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

  if (parsed.valid === false) {
    return invalidAnalysis(query);
  }

  if (parsed.valid !== true || typeof parsed.confidence !== "number" || parsed.confidence < 0.65 || !parsed.goal || !parsed.intent || !Array.isArray(parsed.stages) || parsed.stages.length === 0) {
    return analyzeTaskLocally(query);
  }

  return parsed;
}
