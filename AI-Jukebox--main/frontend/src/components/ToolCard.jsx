const PRICING_STYLES = {
  Free: "bg-emerald-50 text-emerald-700",
  Freemium: "bg-blue-50 text-blue-700",
  Paid: "bg-amber-50 text-amber-700",
  "Open Source": "bg-violet-50 text-violet-700",
};

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function faviconFor(url) {
  try {
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(url)}`;
  } catch {
    return "";
  }
}

export default function ToolCard({
  entry,
  index,
  isSaved,
  onToggleSave,
  onVisit,
  compareSelected,
  onToggleCompare,
  compareDisabled,
}) {
  const tool = entry.tool;
  const bestMatch = entry.bestMatch;
  const logo = tool.logoUrl || faviconFor(tool.officialWebsiteUrl);

  return (
    <article
      className={`group relative flex min-w-0 flex-col rounded-2xl border bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-glow animate-rise ${
        bestMatch ? "border-violet-300" : "border-line hover:border-violet-200"
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {bestMatch && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-rainbow px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
          Best match
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-gradient-to-br from-violet-50 to-rose-50 text-xs font-bold text-stage-video transition-transform duration-200 group-hover:scale-110">
            <span>{initials(tool.name)}</span>
            {logo && (
              <img
                src={logo}
                alt={`${tool.name} logo`}
                className="absolute inset-0 h-full w-full bg-white object-contain p-1.5"
                onError={(event) => { event.currentTarget.style.display = "none"; }}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">{tool.name}</h3>
            <p className="truncate text-xs text-muted">{tool.category}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={isSaved ? `Remove ${tool.name} from saved tools` : `Save ${tool.name}`}
          onClick={() => onToggleSave(tool)}
          className={`focus-ring shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
            isSaved ? "bg-rose-50 text-stage-audio" : "text-muted hover:bg-line hover:text-stage-audio"
          }`}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      <p className="mt-3 min-h-[3.75rem] text-sm leading-relaxed text-muted">{tool.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${PRICING_STYLES[tool.pricing] || "bg-line text-ink"}`}>{tool.pricing}</span>
        <span className="rounded-full bg-line px-2 py-1 text-[10px] font-semibold text-ink">Rating {Number(tool.rating || 0).toFixed(1)}</span>
        <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-semibold text-stage-video">{entry.score}% match</span>
        {tool.apiAvailable && <span className="rounded-full bg-line px-2 py-1 text-[10px] font-semibold text-ink">API</span>}
        {tool.openSource && <span className="rounded-full bg-line px-2 py-1 text-[10px] font-semibold text-ink">Open source</span>}
      </div>

      {tool.capabilities?.length > 0 && (
        <p className="mt-3 line-clamp-1 text-[11px] text-muted">{tool.capabilities.slice(0, 2).join("  /  ")}</p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
        <a
          href={tool.officialWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onVisit(tool)}
          className="focus-ring flex-1 rounded-xl bg-ink px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#2b2833]"
        >
          Visit tool
        </a>
        <button
          type="button"
          onClick={() => onToggleCompare(tool)}
          disabled={!compareSelected && compareDisabled}
          className={`focus-ring rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            compareSelected ? "border-stage-video bg-violet-50 text-stage-video" : "border-line text-muted hover:border-violet-200 hover:text-ink"
          }`}
        >
          {compareSelected ? "Added" : "Compare"}
        </button>
      </div>
    </article>
  );
}
