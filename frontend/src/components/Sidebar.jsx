import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const MAIN_LINKS = [
  { to: "/", label: "Home", icon: "🎵" },
  { to: "/", label: "Find a Tool", icon: "🔍" },
];

const JUKEBOX_LINKS = [
  { to: "/recent", label: "Recent Tasks", icon: "⏱️" },
  { to: "/recently-used", label: "Recently Used", icon: "🎧" },
  { to: "/saved", label: "Saved Tools", icon: "⭐" },
];

function NavList({ links, currentPath }) {
  return (
    <ul className="space-y-1.5">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-ring ${
              currentPath === l.to
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                : "text-zinc-400 hover:bg-purple-950/40 hover:text-purple-100 hover:border hover:border-purple-500/20"
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

  const body = (
    <div className="flex h-full flex-col gap-7 border-r border-purple-900/40 bg-zinc-950/80 backdrop-blur-xl px-3.5 py-6 overflow-hidden">
      <Link to="/" className="flex items-center gap-3 px-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-xs font-bold text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]">
          AJ
        </span>
        <span className="sidebar-text font-display text-xl font-bold tracking-wide bg-gradient-to-r from-purple-300 via-pink-300 to-white bg-clip-text text-transparent">
          AIJukebox
        </span>
      </Link>

      <div>
        <p className="sidebar-text mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-purple-400/70">
          Discover
        </p>
        <NavList links={MAIN_LINKS} currentPath={pathname} />
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
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-[10px] font-bold text-white">
            AJ
          </span>
          <span className="font-display text-base font-bold text-purple-200">AIJukebox</span>
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