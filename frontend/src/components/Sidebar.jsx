import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AJLogo from "./AJLogo.jsx";
import { useSessionMix } from "../context/SessionMixContext.jsx";

const MAIN_LINKS = [
  { to: "/", label: "Home", icon: "🎵" },
  { to: "/find", label: "Find a Tool", icon: "🔍" },
];

const JUKEBOX_LINKS = [
  { to: "/recent", label: "Recently Searched Tasks", icon: "⏱️" },
  { to: "/recently-used", label: "Recently Used Tools", icon: "🎧" },
  { to: "/saved", label: "Saved Tools", icon: "⭐" },
];

function activeTheme(path) {
  if (path === "/find") return "pink";
  if (path === "/results") return "purple";
  if (path === "/recent") return "recent";
  if (path === "/recently-used") return "used";
  if (path === "/saved") return "saved";
  return "purple";
}

function NavList({ links, currentPath }) {
  return (
    <ul className="space-y-1.5">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            className={`sidebar-nav-link sidebar-nav-link--${activeTheme(l.to)} flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-ring ${
              currentPath === l.to ? "sidebar-nav-link--active" : ""
            }`}
          >
            <span className="text-base shrink-0">{l.icon}</span>
            <span className="sidebar-text">{l.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { entries, selectedId, selectWorkflow } = useSessionMix();

  const body = (
    <div className="flex h-full flex-col gap-7 border-r border-purple-900/40 bg-zinc-950/80 backdrop-blur-xl px-3.5 py-6 overflow-hidden">
      <Link to="/" className="flex items-center gap-3 px-1">
        <AJLogo variant="sidebar" className="sidebar-aj-mark" />
        <span className="sidebar-text brand-wordmark font-display text-xl font-bold tracking-wide">
          AIJukebox
        </span>
      </Link>

      <div>
        <p className="sidebar-text mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-purple-400/70">
          Discover
        </p>
        <NavList links={MAIN_LINKS} currentPath={pathname} />
        {entries.length > 0 && (
          <div className="sidebar-mix-tree">
            <Link
              to="/results"
              state={{ result: entries.find((entry) => entry.id === selectedId)?.result || entries[entries.length - 1].result, mixId: selectedId || entries[entries.length - 1].id }}
              className={`sidebar-nav-link sidebar-nav-link--purple sidebar-mix-link flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 focus-ring ${pathname === "/results" ? "sidebar-nav-link--active" : ""}`}
            >
              <span className="text-sm shrink-0">🎚️</span>
              <span className="sidebar-text">Your AI Mix</span>
            </Link>
            <ul className="sidebar-mix-requests">
              {entries.map((entry, index) => (
                <li key={entry.id}>
                  <Link
                    to="/results"
                    state={{ result: entry.result, mixId: entry.id }}
                    onClick={() => selectWorkflow(entry.id)}
                    className={`sidebar-mix-request sidebar-text focus-ring ${selectedId === entry.id ? "sidebar-mix-request--selected" : ""}`}
                    title={entry.query}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{entry.query}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <p className="sidebar-text mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-purple-400/70">
          Your Jukebox
        </p>
        <NavList links={JUKEBOX_LINKS} currentPath={pathname} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop hover-collapsible sidebar */}
      <aside className="hidden shrink-0 md:block z-30">
        <div className="sidebar-drawer h-screen fixed top-0 left-0">
          {body}
        </div>
        {/* Placeholder element to preserve layout structure when collapsed */}
        <div className="w-18 h-screen pointer-events-none" />
      </aside>

      {/* Mobile navigation header */}
      <div className="flex items-center justify-between border-b border-purple-900/40 bg-zinc-950/90 backdrop-blur-md px-4 py-3 md:hidden z-30">
        <Link to="/" className="flex items-center gap-2">
          <AJLogo variant="sidebar" className="sidebar-aj-mark sidebar-aj-mark--mobile" />
          <span className="brand-wordmark font-display text-base font-bold">AIJukebox</span>
        </Link>
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-purple-200 hover:bg-purple-900/30 focus-ring"
        >
          ☰
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-64 h-full">{body}</div>
          <button
            aria-label="Close navigation"
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}