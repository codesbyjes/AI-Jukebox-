import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import ComparisonBar from "../components/ComparisonBar.jsx";
import WorkflowStage from "../components/WorkflowStage.jsx";
import ProcessingState from "../components/ProcessingState.jsx";
import { fetchWorkflow } from "../api/client.js";
import { useLocalList } from "../hooks/useLocalList.js";

const toolKey = (tool) => tool._id || tool.name;

function normaliseWorkflow(workflow) {
  return {
    ...workflow,
    userGoal: workflow.userGoal || workflow.query,
    stages: (workflow.stages || []).map((stage) => ({
      ...stage,
      resultCount: stage.resultCount ?? stage.recommendedTools.length,
      recommendedTools: stage.recommendedTools.map((entry, index) => ({
        ...entry,
        bestMatch: Boolean(entry.bestMatch) || (index === 0 && entry.score >= 60),
      })),
    })),
  };
}

export default function Results() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get("id");
  const [plan, setPlan] = useState(location.state?.result || null);
  const [isLoading, setIsLoading] = useState(!location.state?.result && Boolean(workflowId));
  const [error, setError] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const savedTools = useLocalList("aijukebox:savedTools", { keyFn: toolKey });
  const recentlyUsed = useLocalList("aijukebox:recentlyUsed", { max: 30, keyFn: toolKey });
  const [compareIds, setCompareIds] = useState([]);
  const [compareTools, setCompareTools] = useState({});

  useEffect(() => {
    if (plan || !workflowId) return;
    fetchWorkflow(workflowId)
      .then((workflow) => setPlan(normaliseWorkflow(workflow)))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [plan, workflowId]);

  function handleToggleCompare(tool) {
    const key = toolKey(tool);
    setCompareIds((current) => current.includes(key) ? current.filter((id) => id !== key) : current.length < 3 ? [...current, key] : current);
    setCompareTools((current) => ({ ...current, [key]: tool }));
  }

  const selectedCompareTools = useMemo(() => compareIds.map((id) => compareTools[id]).filter(Boolean), [compareIds, compareTools]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ProcessingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-pink-900/50 bg-zinc-950/80 p-8 backdrop-blur-xl shadow-2xl">
          <span className="text-3xl">⚠️</span>
          <h2 className="mt-3 text-lg font-semibold text-pink-300">Playlist Generation Failed</h2>
          <p className="mt-2 text-sm text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full border border-purple-500/50 bg-purple-950/60 px-5 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-900/60 focus-ring"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const stages = plan.stages || [];
  const request = plan.query || plan.userGoal || "Your AI workflow request";

  return (
    <div className="workflow-page relative mx-auto w-full max-w-5xl space-y-8 overflow-hidden px-4 py-8 sm:px-6">
      <div className="workflow-smoke workflow-smoke--one" />
      <div className="workflow-smoke workflow-smoke--two" />
      <div className="workflow-staff" />
      <div className="workflow-note workflow-note--one" aria-hidden="true">♪</div>
      <div className="workflow-note workflow-note--two" aria-hidden="true">♫</div>
      <div className="workflow-request-card">
        <p className="workflow-eyebrow">Your request</p>
        <p className="mt-2 text-base font-medium leading-relaxed text-rose-50 sm:text-lg">&quot;{request}&quot;</p>
      </div>

      <div className="space-y-5">
        <div className="workflow-heading border-b pb-5">
          <div>
            <p className="workflow-eyebrow">Workflow</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">Your AI Mix</h1>
            <p className="workflow-subtitle mt-2">Your goal, remixed into the steps you need.</p>
          </div>
        </div>

        <div className="space-y-4">
          {stages.map((stage) => (
            <WorkflowStage
              key={stage.order}
              stage={stage}
              open={activeStage === stage.order}
              onToggle={() => setActiveStage((current) => current === stage.order ? null : stage.order)}
              savedTools={savedTools}
              onToggleSave={savedTools.toggle}
              onVisitTool={recentlyUsed.push}
              compareIds={compareIds}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
      </div>
      <ComparisonBar
        tools={selectedCompareTools}
        onRemove={handleToggleCompare}
        onClear={() => { setCompareIds([]); setCompareTools({}); }}
      />
    </div>
  );
}