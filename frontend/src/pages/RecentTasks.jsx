import { Link } from "react-router-dom";
import { useLocalList } from "../hooks/useLocalList.js";

function formatSearchTime(value) {
  if (!value) return "Recently";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RecentTasks() {
  const recentSearches = useLocalList("aijukebox:recentSearches", {
    max: 12,
    keyFn: (item) => item.query,
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl">Recent tasks</h1>
      {recentSearches.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Nothing here yet - search for a task from Find a Tool to get started.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {recentSearches.items.map((item) => (
            <li key={item.query}>
              <Link
                to={item.workflowId ? `/results?id=${item.workflowId}` : "/results"}
                state={item.result ? { result: item.result } : undefined}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition-colors hover:border-stage-video focus-ring"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-50 text-xs font-bold text-stage-video" aria-hidden="true">&gt;</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{item.query}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {formatSearchTime(item.at)}
                    {item.stageCount ? ` | ${item.stageCount} stage${item.stageCount === 1 ? "" : "s"}` : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
