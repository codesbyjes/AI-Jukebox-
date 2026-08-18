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
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-ring ${
            active === f.key
              ? "border-transparent bg-rainbow text-white"
              : "border-line text-muted hover:text-ink"
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
