import { useMemo, useState } from "react";
import Filters, { applyFilter } from "./Filters.jsx";
import ToolCard from "./ToolCard.jsx";
import { stageAccent } from "../utils/stageColor.js";

export default function WorkflowStage({
  stage,
  defaultOpen = false,
  savedTools,
  onToggleSave,
  onVisitTool,
  compareIds,
  onToggleCompare,
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [filter, setFilter] = useState("all");
  const accent = stageAccent(stage.capability);
  const tools = stage.recommendedTools || [];
  const visibleTools = useMemo(() => applyFilter(tools, filter), [tools, filter]);
  const toolCount = stage.resultCount ?? tools.length;

  return (
    <section
      className={`overflow-hidden rounded-[1.45rem] border bg-surface shadow-card transition-all duration-300 ${open ? "shadow-glow" : "hover:border-violet-200"}`}
      style={{ borderColor: open ? accent.hex : undefined }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-6 sm:py-5"
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${accent.hex}, ${accent.hex}bb)` }}
        >
          {String(stage.order).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg leading-tight text-ink sm:text-xl">{stage.input} {"\u2192"} {stage.output}</span>
          {stage.description && <span className="mt-1 block truncate text-sm text-muted">{stage.description}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden text-xs text-muted sm:inline">{toolCount} recommended</span>
          <span
            className={`grid h-8 w-8 place-items-center rounded-full border text-lg transition-all ${open ? "rotate-90 bg-violet-50" : "border-line"}`}
            style={{ color: accent.hex }}
            aria-hidden="true"
          >
            &gt;
          </span>
        </span>
      </button>

      {open && (
        <div className="animate-rise border-t border-line px-4 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
          {tools.length === 0 ? (
            <p className="rounded-xl bg-[#fbfaf8] p-4 text-sm leading-relaxed text-muted">
              No suitable tools from the catalog match this stage yet. Try refining the goal or return after the catalog expands.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Recommended AI tools</p>
                  <p className="mt-1 text-xs text-muted">Filter the playlist without leaving your workflow.</p>
                </div>
                <span className="rounded-full bg-[#fbfaf8] px-2.5 py-1 text-xs text-muted">{visibleTools.length} shown</span>
              </div>
              <div className="mb-5"><Filters active={filter} onChange={setFilter} /></div>
              {visibleTools.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line px-4 py-5 text-sm text-muted">No tools match this filter. Try another one.</p>
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
      )}
    </section>
  );
}
