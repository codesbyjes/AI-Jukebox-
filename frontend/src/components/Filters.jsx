const FILTERS = [
  { key: "all", label: "All" },
  { key: "free", label: "Free" },
  { key: "freemium", label: "Freemium" },
  { key: "paid", label: "Paid" },
  { key: "api", label: "API" },
  { key: "openSource", label: "Open Source" },
  { key: "topRated", label: "Highest Rated" },
];

export default function Filters({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all focus-ring ${
            active === f.key
              ? "border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              : "border-purple-900/40 bg-zinc-900/50 text-zinc-400 hover:border-purple-500/40 hover:text-purple-200"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function applyFilter(entries, filter) {
  switch (filter) {
    case "free":
      return entries.filter((e) => e.tool.pricing === "Free" || e.tool.pricing === "Open Source");
    case "freemium":
      return entries.filter((e) => e.tool.pricing === "Freemium");
    case "paid":
      return entries.filter((e) => e.tool.pricing === "Paid");
    case "api":
      return entries.filter((e) => e.tool.apiAvailable);
    case "openSource":
      return entries.filter((e) => e.tool.openSource);
    case "topRated":
      return [...entries].sort((a, b) => (b.tool.rating || 0) - (a.tool.rating || 0));
    default:
      return entries;
  }
}