import mongoose from "mongoose";

const StageSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    name: { type: String, required: true },
    input: { type: String, required: true },
    output: { type: String, required: true },
    capability: { type: String, required: true },
    description: { type: String, default: "" },
    // Snapshot of the ranked tool ids + scores at generation time, so a
    // saved workflow keeps showing the same recommendations even if the
    // catalog changes later.
    recommendedTools: [
      {
        tool: { type: mongoose.Schema.Types.ObjectId, ref: "Tool" },
        score: Number,
        reasons: [String],
      },
    ],
  },
  { _id: false }
);

const WorkflowSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    clientId: { type: String, index: true },
    goal: { type: String, required: true },
    input: { type: String, default: "" },
    output: { type: String, default: "" },
    constraints: { type: mongoose.Schema.Types.Mixed, default: {} },
    stages: { type: [StageSchema], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Workflow", WorkflowSchema);
