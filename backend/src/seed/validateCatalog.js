import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.resolve(
  __dirname,
  "../../data/aijukebox-tools-merged.json"
);

const REQUIRED_FIELDS = [
  "name",
  "description",
  "category",
  "capabilities",
  "inputTypes",
  "outputTypes",
  "pricing",
  "freeTier",
  "apiAvailable",
  "openSource",
  "tags",
  "officialWebsiteUrl",
];

const VALID_CAPABILITIES = new Set([
  "document summarization",
  "research assistance",
  "research summarization",
  "script generation",
  "content generation",
  "writing assistance",

  "text to speech",
  "speech to text",

  "AI video generation",
  "video editing",
  "audio editing",

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
]);

function isValidUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function main() {
  const tools = JSON.parse(
    fs.readFileSync(CATALOG_PATH, "utf8")
  );

  console.log(`\n========== AI JUKEBOX CATALOG VALIDATION ==========\n`);
  console.log(`Total tools: ${tools.length}\n`);

  const errors = [];
  const warnings = [];

  const names = new Map();

  tools.forEach((tool, index) => {
    const label = `${tool.name || "UNKNOWN"} [index ${index}]`;

    // --------------------------------------------------
    // Required fields
    // --------------------------------------------------

    for (const field of REQUIRED_FIELDS) {
      if (
        tool[field] === undefined ||
        tool[field] === null
      ) {
        errors.push(`${label}: missing "${field}"`);
      }
    }

    // --------------------------------------------------
    // Name
    // --------------------------------------------------

    if (!tool.name || !String(tool.name).trim()) {
      errors.push(`${label}: empty name`);
    }

    // --------------------------------------------------
    // Duplicate names
    // --------------------------------------------------

    const normalizedName = String(tool.name || "")
      .toLowerCase()
      .trim();

    if (normalizedName) {
      if (names.has(normalizedName)) {
        warnings.push(
          `Duplicate tool name: "${tool.name}" at indexes ${names.get(
            normalizedName
          )} and ${index}`
        );

        names.set(
          normalizedName,
          `${names.get(normalizedName)}, ${index}`
        );
      } else {
        names.set(normalizedName, index);
      }
    }

    // --------------------------------------------------
    // Capabilities
    // --------------------------------------------------

    if (
      !Array.isArray(tool.capabilities) ||
      tool.capabilities.length === 0
    ) {
      errors.push(`${label}: no capabilities`);
    } else {
      for (const capability of tool.capabilities) {
        if (!VALID_CAPABILITIES.has(capability)) {
          errors.push(
            `${label}: invalid capability "${capability}"`
          );
        }
      }
    }

    // --------------------------------------------------
    // Input / output
    // --------------------------------------------------

    if (!Array.isArray(tool.inputTypes)) {
      errors.push(`${label}: inputTypes is not an array`);
    }

    if (!Array.isArray(tool.outputTypes)) {
      errors.push(`${label}: outputTypes is not an array`);
    }

    // --------------------------------------------------
    // Pricing
    // --------------------------------------------------

    const validPricing = [
  "Free",
  "Freemium",
  "Paid",
  "Open Source",
  "Unknown",
];

    if (!validPricing.includes(tool.pricing)) {
      warnings.push(
        `${label}: unusual pricing "${tool.pricing}"`
      );
    }

    // --------------------------------------------------
    // Website
    // --------------------------------------------------

    if (!isValidUrl(tool.officialWebsiteUrl)) {
      warnings.push(
        `${label}: invalid/missing official website URL`
      );
    }

    // --------------------------------------------------
    // Description
    // --------------------------------------------------

    if (
      !tool.description ||
      String(tool.description).trim().length < 20
    ) {
      warnings.push(
        `${label}: very short or missing description`
      );
    }

    // --------------------------------------------------
    // Source
    // --------------------------------------------------

    if (!tool.source) {
      warnings.push(`${label}: no source information`);
    }

    // --------------------------------------------------
    // Imported AIFOXX records
    // --------------------------------------------------

    if (tool.source === "AIFOXX") {
      if (!tool.sourceId) {
        warnings.push(
          `${label}: AIFOXX tool missing sourceId`
        );
      }

      if (!tool.sourceLastVerified) {
        warnings.push(
          `${label}: missing sourceLastVerified`
        );
      }
    }
  });

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------

  console.log(`ERRORS: ${errors.length}`);
  console.log(`WARNINGS: ${warnings.length}\n`);

  if (errors.length > 0) {
    console.log("========== ERRORS ==========\n");

    errors.slice(0, 50).forEach((error) => {
      console.log("❌ " + error);
    });

    if (errors.length > 50) {
      console.log(
        `\n...and ${errors.length - 50} more errors.`
      );
    }
  }

  if (warnings.length > 0) {
    console.log("\n========== WARNINGS ==========\n");

    warnings.slice(0, 30).forEach((warning) => {
      console.log("⚠️ " + warning);
    });

    if (warnings.length > 30) {
      console.log(
        `\n...and ${warnings.length - 30} more warnings.`
      );
    }
  }

  console.log("\n========== RESULT ==========\n");

  if (errors.length === 0) {
    console.log("✅ No critical validation errors.");
    console.log("The catalog is structurally valid.");
  } else {
    console.log(
      "❌ Catalog has critical errors."
    );
    console.log(
      "DO NOT seed MongoDB yet."
    );
  }

  console.log();
}

main();