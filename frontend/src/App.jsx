import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import IntroAnimation from "./components/IntroAnimation.jsx";
import Home from "./pages/Home.jsx";
import FindTool from "./pages/FindTool.jsx";
import Results from "./pages/Results.jsx";
import RecentTasks from "./pages/RecentTasks.jsx";
import RecentlyUsed from "./pages/RecentlyUsed.jsx";
import SavedTools from "./pages/SavedTools.jsx";
import { SessionMixProvider } from "./context/SessionMixContext.jsx";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const { pathname } = useLocation();
  const libraryClass = pathname === "/recent"
    ? "recent-searches-shell"
    : pathname === "/recently-used"
      ? "recently-used-shell"
      : pathname === "/saved"
        ? "saved-tools-shell"
        : pathname === "/results"
          ? "workflow-shell"
          : "";

  useEffect(() => {
    document.body.classList.remove("workflow-body", "recent-searches-body", "recently-used-body", "saved-tools-body");
    if (pathname === "/results") document.body.classList.add("workflow-body");
    if (pathname === "/recent") document.body.classList.add("recent-searches-body");
    if (pathname === "/recently-used") document.body.classList.add("recently-used-body");
    if (pathname === "/saved") document.body.classList.add("saved-tools-body");
    return () => document.body.classList.remove("workflow-body", "recent-searches-body", "recently-used-body", "saved-tools-body");
  }, [pathname]);

  function finishIntro() {
    sessionStorage.setItem("aijukebox:introShown", "1");
    setShowIntro(false);
  }

  return (
    <SessionMixProvider>
      {showIntro && <IntroAnimation onDone={finishIntro} />}
      <div className={`app-shell flex min-h-screen bg-canvas ${libraryClass}`}>
        <Sidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<FindTool />} />
            <Route path="/results" element={<Results />} />
            <Route path="/recent" element={<RecentTasks />} />
            <Route path="/recently-used" element={<RecentlyUsed />} />
            <Route path="/saved" element={<SavedTools />} />
          </Routes>
        </main>
      </div>
    </SessionMixProvider>
  );
}
