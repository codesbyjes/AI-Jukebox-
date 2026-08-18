import { useLocalList } from "../hooks/useLocalList.js";

const toolKey = (t) => t._id || t.name;

export default function RecentlyUsed() {
  const recentlyUsed = useLocalList("aijukebox:recentlyUsed", { max: 30, keyFn: toolKey });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl">Recently used AI</h1>
      {recentlyUsed.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Tools you visit from a workflow will show up here, newest first.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {recentlyUsed.items.map((tool) => (
            <li key={toolKey(tool)}>
              <a
                href={tool.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm transition-colors hover:border-stage-video focus-ring"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-line text-[10px] font-semibold">
                  {tool.name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="block font-medium">{tool.name}</span>
                  <span className="block text-xs text-muted">{tool.category}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
