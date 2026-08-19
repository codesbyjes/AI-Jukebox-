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
    <div className="library-page recent-searches-page">
      <div className="library-atmosphere" aria-hidden="true"><span>♪</span><span>♫</span><span>✦</span></div>
      <div className="library-inner max-w-4xl">
        <div className="library-kicker">Your history <span>✦</span></div>
        <h1 className="library-title font-display">Your Recent Searches</h1>
        <p className="library-subtitle">Pick up where you left off.</p>
      {recentSearches.items.length === 0 ? (
        <div className="library-empty recent-empty">
          <div className="empty-waveform" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
          <h2>No searches yet</h2>
          <p>Your AIJukebox journeys will appear here.</p>
          <Link to="/find" className="library-empty-cta focus-ring">Find a tool <span>→</span></Link>
        </div>
      ) : (
        <ul className="recent-search-list">
          {recentSearches.items.map((item) => (
            <li key={item.query}>
              <Link
                to={item.workflowId ? `/results?id=${item.workflowId}` : "/results"}
                state={item.result ? { result: item.result } : undefined}
                className="recent-search-card focus-ring"
              >
                <span className="recent-search-mark" aria-hidden="true">⌁</span>
                <span className="recent-search-copy">
                  <span className="recent-search-query">{item.query}</span>
                  <span className="recent-search-meta">
                    {formatSearchTime(item.at)}
                    {item.stageCount ? ` | ${item.stageCount} stage${item.stageCount === 1 ? "" : "s"}` : ""}
                  </span>
                </span>
                <span className="recent-search-cta">Continue workflow <span>→</span></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
