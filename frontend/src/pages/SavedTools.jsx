import { useLocalList } from "../hooks/useLocalList.js";

const toolKey = (t) => t._id || t.name;

export default function SavedTools() {
  const savedTools = useLocalList("aijukebox:savedTools", { keyFn: toolKey });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl">Saved tools</h1>
      {savedTools.items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Tap the star on any tool card to save it here for later.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {savedTools.items.map((tool) => (
            <li
              key={toolKey(tool)}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm"
            >
              <a
                href={tool.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 focus-ring"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-line text-[10px] font-semibold">
                  {tool.name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <span className="block font-medium">{tool.name}</span>
                  <span className="block text-xs text-muted">{tool.category}</span>
                </span>
              </a>
              <button
                onClick={() => savedTools.remove(tool)}
                className="text-lg text-stage-audio focus-ring"
                aria-label={`Remove ${tool.name} from saved tools`}
              >
                ★
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
