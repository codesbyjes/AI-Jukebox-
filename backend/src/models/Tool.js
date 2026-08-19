import mongoose from "mongoose";

const ToolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },

    // What the tool can do / consume / produce.
    capabilities: { type: [String], required: true, index: true },
    inputTypes: { type: [String], default: [] },
    outputTypes: { type: [String], default: [] },

    pricing: {
      type: String,
      enum: ["Free", "Freemium", "Paid", "Open Source"],
      required: true,
    },
    freeTier: { type: Boolean, default: false },
    apiAvailable: { type: Boolean, default: false },
    openSource: { type: Boolean, default: false },

    rating: { type: Number, min: 0, max: 5, default: 4.0 },
    qualityScore: { type: Number, min: 0, max: 100, default: 70 },

    tags: { type: [String], default: [], index: true },
    officialWebsiteUrl: { type: String, required: true },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

ToolSchema.index({ capabilities: 1, category: 1 });
ToolSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Tool", ToolSchema);
