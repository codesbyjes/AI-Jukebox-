import { useMemo, useState } from "react";
import Filters, { applyFilter } from "./Filters.jsx";
import ToolCard from "./ToolCard.jsx";
import { stageAccent } from "../utils/stageColor.js";

export default function WorkflowStage({
  stage,
  open = false,
  onToggle,
  savedTools,
  onToggleSave,
  onVisitTool,
  compareIds,
  onToggleCompare,
}) {
  const [filter, setFilter] = useState("all");
  const accent = stageAccent(stage.capability);
  const tools = stage.recommendedTools || [];
  const visibleTools = useMemo(() => applyFilter(tools, filter), [tools, filter]);
  const toolCount = stage.resultCount ?? tools.length;

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-zinc-950/70 backdrop-blur-xl shadow-xl transition-all duration-300 ${
        open ? "border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.25)]" : "border-purple-900/30 hover:border-purple-500/40"
      }`}
      style={{ borderColor: open ? accent.hex : undefined }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="focus-ring flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${accent.hex}, #1e1b4b)` }}
        >
          {String(stage.order).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg font-semibold leading-tight text-purple-100 sm:text-xl">
            {stage.input} <span className="text-pink-400">{"\u2192"}</span> {stage.output}
          </span>
          {stage.description && <span className="mt-1 block truncate text-sm text-zinc-400">{stage.description}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-purple-300/60 sm:inline">{toolCount} recommended</span>
          <span
            className={`grid h-8 w-8 place-items-center rounded-full border text-lg transition-all ${
              open ? "rotate-90 bg-purple-900/40 border-purple-500 text-white" : "border-purple-900/40 text-purple-400"
            }`}
            style={{ color: open ? "#ffffff" : accent.hex }}
            aria-hidden="true"
          >
            &gt;
          </span>
        </span>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className={`min-h-0 overflow-hidden border-t border-purple-900/30 transition-[opacity,transform] duration-300 ease-out ${open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}>
          <div key={open ? "open" : "closed"} className="px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          {tools.length === 0 ? (
            <p className="rounded-xl bg-zinc-900/50 p-4 text-sm leading-relaxed text-zinc-400 border border-purple-900/20">
              No suitable tools from the catalog match this stage yet. Try refining the goal or return after the catalog expands.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-400">Recommended AI tools</p>
                  <p className="mt-1 text-xs text-zinc-400">Filter the playlist without leaving your workflow.</p>
                </div>
                <span className="rounded-full bg-purple-950/60 border border-purple-800/40 px-3 py-1 text-xs text-purple-300">
                  {visibleTools.length} shown
                </span>
              </div>
              <div className="mb-5"><Filters active={filter} onChange={setFilter} /></div>
              {visibleTools.length === 0 ? (
                <p className="rounded-xl border border-dashed border-purple-900/40 px-4 py-5 text-sm text-zinc-400">
                  No tools match this filter. Try another one.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleTools.map((entry, index) => (
                    <ToolCard
                      key={entry.tool._id || entry.tool.name}
                      entry={entry}
                      index={index}
                      isSaved={savedTools.has(entry.tool)}
                      onToggleSave={onToggleSave}
                      onVisit={onVisitTool}
                      compareSelected={compareIds.includes(entry.tool._id || entry.tool.name)}
                      onToggleCompare={onToggleCompare}
                      compareDisabled={compareIds.length >= 3}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}