import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ComparisonBar from "../components/ComparisonBar.jsx";
import WorkflowStage from "../components/WorkflowStage.jsx";
import { fetchWorkflow } from "../api/client.js";
import { useLocalList } from "../hooks/useLocalList.js";

const toolKey = (tool) => tool._id || tool.name;

function normaliseWorkflow(workflow) {
  return {
    workflowId: workflow._id,
    query: workflow.query,
    goal: workflow.goal,
    input: workflow.input,
    output: workflow.output,
    constraints: workflow.constraints,
    stages: workflow.stages.map((stage) => ({
      ...stage,
      resultCount: stage.resultCount ?? stage.recommendedTools.length,
      recommendedTools: stage.recommendedTools.map((entry, index) => ({
        tool: entry.tool,
        score: entry.score,
        reasons: entry.reasons,
        bestMatch: Boolean(entry.bestMatch) || (index === 0 && entry.score >= 60),
      })),
    })),
  };
}

export default function Results() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get("id");
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result && Boolean(workflowId));
  const [error, setError] = useState(null);
  const savedTools = useLocalList("aijukebox:savedTools", { keyFn: toolKey });
  const recentlyUsed = useLocalList("aijukebox:recentlyUsed", { max: 30, keyFn: toolKey });
  const [compareIds, setCompareIds] = useState([]);
  const [compareTools, setCompareTools] = useState({});

  useEffect(() => {
    if (result || !workflowId) return;
    setLoading(true);
    fetchWorkflow(workflowId)
      .then((workflow) => setResult(normaliseWorkflow(workflow)))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [workflowId, result]);

  function handleToggleCompare(tool) {
    const key = toolKey(tool);
    setCompareIds((current) => {
      if (current.includes(key)) return current.filter((id) => id !== key);
      return current.length < 3 ? [...current, key] : current;
    });
    setCompareTools((current) => ({ ...current, [key]: tool }));
  }

  const selectedCompareTools = useMemo(
    () => compareIds.map((id) => compareTools[id]).filter(Boolean),
    [compareIds, compareTools]
  );

  if (loading) return <p className="p-10 text-center text-muted">Loading your workflow...</p>;

  if (error || !result) {
    return (
      <div className="p-10 text-center">
        <p className="text-rose-600">{error || "We couldn't find that workflow."}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-stage-video underline">Start a new search</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 pb-32 pt-10 sm:px-6">
      <div className="rounded-[2rem] border border-line bg-surface/70 px-6 py-6 shadow-card sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Your AI Playlist</p>
        <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-4xl">
          {result.input} <span className="rainbow-text">{"\u2192"}</span> {result.output}
        </h1>
        <div className="mt-5 flex items-start gap-3 border-t border-line pt-4">
          <span className="mt-0.5 text-stage-video">*</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Your goal</p>
            <p className="mt-1 text-[15px] leading-relaxed text-ink">{result.query}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 mt-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Your workflow</p>
          <p className="mt-1 text-sm text-muted">Open a stage to reveal the AI tools that can take it forward.</p>
        </div>
        <span className="hidden rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted sm:block">
          {result.stages.length} stage{result.stages.length === 1 ? "" : "s"}
        </span>
      </div>

      <div>
        {result.stages.map((stage, index) => (
          <div key={stage.order} className="animate-rise" style={{ animationDelay: `${index * 130}ms` }}>
            <WorkflowStage
              stage={stage}
              defaultOpen={false}
              savedTools={savedTools}
              onToggleSave={savedTools.toggle}
              onVisitTool={recentlyUsed.push}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
            />
            {index < result.stages.length - 1 && <div className="workflow-connector" aria-hidden="true" />}
          </div>
        ))}
      </div>

      <ComparisonBar
        tools={selectedCompareTools}
        onRemove={handleToggleCompare}
        onClear={() => {
          setCompareIds([]);
          setCompareTools({});
        }}
      />
    </div>
  );
}
