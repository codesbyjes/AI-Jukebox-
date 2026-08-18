import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AJLogo from "../components/AJLogo.jsx";

const EQUALIZER_BARS = [28, 46, 68, 38, 58, 76, 42, 62, 34, 54, 72, 44];
const PARTICLES = [
  { left: "12%", top: "24%", delay: "0s", size: "2px" },
  { left: "22%", top: "72%", delay: "1.8s", size: "3px" },
  { left: "78%", top: "28%", delay: "2.6s", size: "2px" },
  { left: "88%", top: "68%", delay: "0.9s", size: "3px" },
  { left: "66%", top: "14%", delay: "3.4s", size: "2px" },
  { left: "35%", top: "84%", delay: "2.1s", size: "2px" },
];

export default function Home() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  function openFindTool() {
    setLeaving(true);
    window.setTimeout(() => navigate("/find"), 380);
  }

  return (
    <div className={`home-experience relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#08050f] px-6 py-16 text-center ${leaving ? "home-experience--leaving" : ""}`}>
      <div className="home-atmosphere" aria-hidden="true" />
      <div className="home-visualizer home-visualizer--one" aria-hidden="true" />
      <div className="home-visualizer home-visualizer--two" aria-hidden="true" />
      <div className="home-orbit home-orbit--outer" aria-hidden="true" />
      <div className="home-orbit home-orbit--inner" aria-hidden="true" />
      <div className="home-waveform" aria-hidden="true">
        {EQUALIZER_BARS.map((height, index) => (
          <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }} />
        ))}
      </div>
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="home-particle"
          aria-hidden="true"
          style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, width: particle.size, height: particle.size }}
        />
      ))}
      <span className="home-note home-note--one" aria-hidden="true">♪</span>
      <span className="home-note home-note--two" aria-hidden="true">♫</span>
      <span className="home-note home-note--three" aria-hidden="true">♩</span>

      <div className="relative z-10 flex max-w-xl flex-col items-center">
        <AJLogo className="home-mark mb-7" />
        <p className="brand-wordmark text-[10px] font-bold uppercase tracking-[0.35em]">AIJukebox</p>
        <h1 className="brand-wordmark mt-4 font-display text-5xl font-bold tracking-tight sm:text-7xl">AIJukebox</h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-purple-100/70 sm:text-lg">
          Find the right AI tools for any task - and turn them into a complete workflow.
        </p>
        <button
          type="button"
          onClick={openFindTool}
          className="home-cta focus-ring mt-9 rounded-full border border-purple-200/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(168,85,247,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-300/60 hover:bg-purple-400/20 hover:shadow-[0_0_42px_rgba(236,72,153,0.48)] active:translate-y-0"
        >
          Find a Tool <span className="ml-1 text-pink-300">-&gt;</span>
        </button>
      </div>
    </div>
  );
}
