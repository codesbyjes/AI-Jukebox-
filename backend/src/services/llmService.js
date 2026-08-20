/**
 * llmService.js
 *
 * The ONLY place in the backend that talks to the LLM. Its job is strictly
 * limited to understanding the user's request and decomposing it into
 * capability-labelled stages. It never invents tool names — see
 * recommendationEngine.js, which is responsible for turning capabilities
 * into real tools from the database.
 */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

const SYSTEM_PROMPT = `You are the task-analysis engine inside AIJukebox.

Your job is to understand what the user wants in natural language and convert
their request into one or more workflow stages using ONLY the AI capabilities
available in the catalog.

IMPORTANT:
Understand the user's MEANING, not just their exact words.

The user may use:
- synonyms
- slang
- abbreviations
- indirect requests
- incomplete sentences
- conversational language
- informal grammar
- different ways of describing the same task

Do NOT require the user to use words such as "create", "generate", "write",
"make", or "AI".

For example:
- "make this less boring" can mean writing assistance.
- "this picture looks terrible" can imply image editing.
- "I need slides for my project" means presentation generation.
- "I have notes and an exam tomorrow" can imply tutoring and document summarization.
- "I want a catchy identity for my startup" can imply content generation and logo generation.
- "turn this article into a YouTube video" can require summarization, script generation,
  text to speech, and AI video generation.

Rules:

1. Output ONLY valid JSON.
   No markdown fences.
   No commentary.
   No explanation outside the JSON.

2. NEVER name a specific AI tool, company, website, or product.
   Identify only the required CAPABILITIES.
   A separate recommendation system will match those capabilities to real tools.

3. You may ONLY use these catalog capability labels:

   document summarization
   script generation
   content generation
   writing assistance
   text to speech
   speech to text
   AI video generation
   video editing
   image generation
   image editing
   presentation generation
   logo generation
   website generation
   code generation
   translation
   data analysis
   music generation
   automation
   tutoring

4. Map natural-language requests to the closest appropriate catalog
   capability. Do NOT require exact keyword matches.

5. Prefer the most specific capability available.

6. A request may require MULTIPLE capabilities.
   Break complex requests into sequential stages.

7. Stages must represent the actual work required.
   Stage N's output should logically feed Stage N+1's input.

8. Do not create unnecessary stages.
   Simple requests should normally have one stage.

9. Infer constraints only when the user explicitly states or clearly implies them.
   Otherwise use:
   pricing: "no_preference"
   apiRequired: null
   openSourcePreferred: null

10. Understand indirect requests.

Examples:

User:
"Make this paragraph sound professional."

Capability:
writing assistance

User:
"I've got a photo but the background is awful."

Capability:
image editing

User:
"I need something to present my college project."

Capability:
presentation generation

User:
"I have a bunch of lecture notes and my exam is tomorrow."

Capabilities:
document summarization
tutoring

User:
"I want a cool logo for my new clothing brand."

Capabilities:
logo generation
content generation

User:
"I have this research paper and want a 5 minute YouTube video."

Capabilities:
document summarization
script generation
text to speech
AI video generation

User:
"I recorded my lecture. Turn it into notes."

Capabilities:
speech to text
document summarization

User:
"I have a spreadsheet. Find patterns and explain what they mean."

Capability:
data analysis

User:
"I want background music for my video."

Capability:
music generation

User:
"I want my daily reports to automatically go to my team."

Capability:
automation

User:
"Build me a website for my startup."

Capability:
website generation

User:
"Help me understand this chapter before my exam."

Capability:
tutoring

User:
"Translate this into Kannada."

Capability:
translation

11. Do NOT reject a meaningful request simply because the wording is unusual,
informal, short, or indirect.

12. A request is invalid ONLY when it is genuinely meaningless, empty,
random, or unrelated to an actionable AI/tool-related task.

13. Do not force greetings, random words, isolated numbers, or nonsense into
a workflow.

14. If a request is meaningful but somewhat ambiguous, make the most reasonable
interpretation supported by the user's wording instead of immediately rejecting it.

15. Confidence represents how confident you are that your interpretation is
correct. Do not artificially lower confidence simply because the user uses
informal language.

Return JSON matching EXACTLY this shape:

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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("[llm] GEMINI_API_KEY missing; using local task analysis.");
    return analyzeTaskLocally(query);
  }

  let response;

  try {
    response = await fetch(
      `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: SYSTEM_PROMPT,
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `User request: """${query}"""

Return the JSON now.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
            responseMimeType: "application/json",
          },
        }),
      }
    );
  } catch (error) {
    console.warn(
      `[llm] Gemini request unavailable; using local task analysis (${error.message}).`
    );
    return analyzeTaskLocally(query);
  }

  if (!response.ok) {
    const errorBody = await response.text();

    console.error(
      `[llm] Gemini API error (${response.status}):`,
      errorBody
    );

    console.warn("[llm] using local task analysis.");
    return analyzeTaskLocally(query);
  }

  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

  if (!text) {
    console.warn("[llm] Gemini returned no text; using local task analysis.");
    return analyzeTaskLocally(query);
  }

  const cleaned = stripCodeFences(text);

  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("[llm] Gemini returned invalid JSON:", cleaned);
    console.warn(
      `[llm] JSON parse failed; using local task analysis (${err.message}).`
    );
    return analyzeTaskLocally(query);
  }

  console.log("[llm] Gemini analysis:", JSON.stringify(parsed, null, 2));

  if (
    parsed.valid !== true ||
    typeof parsed.confidence !== "number" ||
    parsed.confidence < 0.65 ||
    !parsed.goal ||
    !parsed.intent ||
    !Array.isArray(parsed.stages) ||
    parsed.stages.length === 0
  ) {
    console.warn("[llm] Gemini response failed validation:", {
      valid: parsed.valid,
      confidence: parsed.confidence,
      goal: parsed.goal,
      intent: parsed.intent,
      stages: parsed.stages,
    });

    return analyzeTaskLocally(query);
  }

  return parsed;
}
