import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const MAIN_LINKS = [
  { to: "/", label: "Home" },
  { to: "/", label: "Find a Tool" },
];

const JUKEBOX_LINKS = [
  { to: "/recent", label: "Recent Tasks" },
  { to: "/recently-used", label: "Recently Used" },
  { to: "/saved", label: "Saved Tools" },
];

function NavList({ links, currentPath }) {
  return (
    <ul className="space-y-1">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors focus-ring ${
              currentPath === l.to
                ? "bg-ink text-white"
                : "text-muted hover:bg-line/60 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const body = (
    <div className="flex h-full w-64 flex-col gap-8 border-r border-line bg-surface px-5 py-6">
      <Link to="/" className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rainbow text-xs font-semibold text-white">
          AJ
        </span>
        <span className="font-display text-lg">AIJukebox</span>
      </Link>

      <div>
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted">
          Discover
        </p>
        <NavList links={MAIN_LINKS} currentPath={pathname} />
      </div>

      <div>
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted">
          Your Jukebox
        </p>
        <NavList links={JUKEBOX_LINKS} currentPath={pathname} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden shrink-0 md:block">{body}</aside>

      {/* Mobile drawer */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rainbow text-[10px] font-semibold text-white">
            AJ
          </span>
          <span className="font-display text-base">AIJukebox</span>
        </Link>
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-ink focus-ring"
        >
          ☰
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="animate-rise">{body}</div>
          <button
            aria-label="Close navigation"
            className="flex-1 bg-ink/40"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
