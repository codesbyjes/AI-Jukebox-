import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import IntroAnimation from "./components/IntroAnimation.jsx";
import Home from "./pages/Home.jsx";
import FindTool from "./pages/FindTool.jsx";
import Results from "./pages/Results.jsx";
import RecentTasks from "./pages/RecentTasks.jsx";
import RecentlyUsed from "./pages/RecentlyUsed.jsx";
import SavedTools from "./pages/SavedTools.jsx";

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  function finishIntro() {
    sessionStorage.setItem("aijukebox:introShown", "1");
    setShowIntro(false);
  }

  return (
    <>
      {showIntro && <IntroAnimation onDone={finishIntro} />}
      <div className="flex min-h-screen bg-canvas">
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
    </>
  );
}
