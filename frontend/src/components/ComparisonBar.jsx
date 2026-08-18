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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-purple-900/50 bg-zinc-950/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="mx-auto max-w-5xl px-4 py-3">
        {!expanded ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-purple-300">
                {tools.length} tool{tools.length > 1 ? "s" : ""} selected
              </span>
              <div className="flex -space-x-2">
                {tools.map((t) => (
                  <span
                    key={t._id || t.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-950 bg-purple-900/60 text-[10px] font-bold text-white shadow-md"
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
                className="rounded-full px-3 py-1.5 text-xs text-zinc-400 hover:text-white focus-ring transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setExpanded(true)}
                disabled={tools.length < 2}
                className="silver-btn focus-ring rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              >
                Compare selected
              </button>
            </div>
          </div>
        ) : (
          <div className="max-h-[70vh] overflow-auto py-2">
            <div className="mb-2 flex items-center justify-between border-b border-purple-900/40 pb-2">
              <p className="text-sm font-semibold text-purple-200">Comparing {tools.length} tools</p>
              <button
                onClick={() => setExpanded(false)}
                className="rounded-full px-3 py-1 text-xs text-zinc-400 hover:text-white focus-ring"
              >
                Collapse
              </button>
            </div>
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-32 py-2 text-left text-xs uppercase tracking-wider text-purple-400">
                    Tool
                  </th>
                  {tools.map((t) => (
                    <th key={t._id || t.name} className="px-3 py-2 text-left font-semibold text-white">
                      {t.name}
                      <button
                        onClick={() => onRemove(t)}
                        className="ml-2 text-xs text-zinc-500 hover:text-pink-400"
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
                  <tr key={row.key} className="border-t border-purple-900/30">
                    <td className="py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-400">
                      {row.label}
                    </td>
                    {tools.map((t) => (
                      <td key={t._id || t.name} className="px-3 py-2.5 text-purple-100">
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