import { useLocalList } from "../hooks/useLocalList.js";

const toolKey = (t) => t._id || t.name;

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatUsedTime(value) {
  if (!value) return "Recently used";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function RecentlyUsed() {
  const recentlyUsed = useLocalList("aijukebox:recentlyUsed", { max: 30, keyFn: toolKey });

  return (
    <div className="library-page recently-used-page">
      <div className="library-atmosphere" aria-hidden="true"><span>♫</span><span>▂▅▇</span><span>·</span><span>♪</span></div>
      <div className="library-inner max-w-5xl">
        <div className="library-kicker">Your toolkit <span>✦</span></div>
        <h1 className="library-title font-display">Recently Used Tools</h1>
        <p className="library-subtitle">Your AI toolkit, ready to play again.</p>
      {recentlyUsed.items.length === 0 ? (
        <div className="library-empty used-empty">
          <div className="empty-album-mark" aria-hidden="true">♫</div>
          <h2>Your AI playlist is empty</h2>
          <p>Tools you use will appear here.</p>
          <a href="/find" className="library-empty-cta focus-ring">Find your next AI tool <span>→</span></a>
        </div>
      ) : (
        <ul className="tool-shelf-list">
          {recentlyUsed.items.map((tool) => (
            <li key={toolKey(tool)}>
              <a
                href={tool.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="used-tool-card focus-ring"
              >
                <span className="used-tool-logo">{initials(tool.name)}</span>
                <span className="used-tool-copy">
                  <span className="used-tool-name">{tool.name}</span>
                  <span className="used-tool-category">{tool.category}</span>
                  <span className="used-tool-use">Used from your workflow</span>
                  <span className="used-tool-time">Last used {formatUsedTime(tool.at)}</span>
                </span>
                <span className="used-tool-cta">Use again <span>→</span></span>
              </a>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
