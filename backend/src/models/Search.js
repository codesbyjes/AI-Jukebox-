import mongoose from "mongoose";

const SearchSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    // Anonymous MVP: no auth yet, so we key by a client-generated id
    // sent from localStorage. Swap for a real user ref once auth exists.
    clientId: { type: String, index: true },
    intent: { type: mongoose.Schema.Types.Mixed },
    workflowId: { type: mongoose.Schema.Types.ObjectId, ref: "Workflow" },
  },
  { timestamps: true }
);

export default mongoose.model("Search", SearchSchema);
