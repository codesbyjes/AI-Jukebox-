import { useState } from "react";

const ROWS = [
  { key: "pricing", label: "Pricing" },
  { key: "freeTier", label: "Free tier", format: (v) => (v ? "Yes" : "No") },
  { key: "apiAvailable", label: "API", format: (v) => (v ? "Yes" : "No") },
  { key: "openSource", label: "Open source", format: (v) => (v ? "Yes" : "No") },
  { key: "rating", label: "Rating", format: (v) => `⭐ ${v?.toFixed(1)}` },
  { key: "capabilities", label: "Capabilities", format: (v) => v?.join(", ") },
  { key: "category", label: "Category" },
  { key: "inputTypes", label: "Input", format: (v) => v?.join(", ") },
  { key: "outputTypes", label: "Output", format: (v) => v?.join(", ") },
];

export default function ComparisonBar({ tools, onRemove, onClear }) {
  const [expanded, setExpanded] = useState(false);

  if (tools.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        {!expanded ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted">
                {tools.length} tool{tools.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex -space-x-2">
                {tools.map((t) => (
                  <span
                    key={t._id || t.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-line text-[10px] font-semibold"
                    title={t.name}
                  >
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClear}
                className="rounded-full px-3 py-1.5 text-xs text-muted hover:text-ink focus-ring"
              >
                Clear
              </button>
              <button
                onClick={() => setExpanded(true)}
                disabled={tools.length < 2}
                className="rounded-full bg-rainbow px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40 focus-ring"
              >
                Compare selected
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto py-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">Comparing {tools.length} tools</p>
              <button
                onClick={() => setExpanded(false)}
                className="rounded-full px-3 py-1 text-xs text-muted hover:text-ink focus-ring"
              >
                Collapse
              </button>
            </div>
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-32 py-2 text-left text-xs uppercase tracking-wide text-muted">
                    Tool
                  </th>
                  {tools.map((t) => (
                    <th key={t._id || t.name} className="px-3 py-2 text-left font-semibold">
                      {t.name}
                      <button
                        onClick={() => onRemove(t)}
                        className="ml-2 text-xs text-muted hover:text-ink"
                        aria-label={`Remove ${t.name} from comparison`}
                      >
                        ✕
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-line">
                    <td className="py-2 text-xs font-medium uppercase tracking-wide text-muted">
                      {row.label}
                    </td>
                    {tools.map((t) => (
                      <td key={t._id || t.name} className="px-3 py-2 text-ink">
                        {row.format ? row.format(t[row.key]) : t[row.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
