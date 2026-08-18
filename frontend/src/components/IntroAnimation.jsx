import { useEffect, useState } from "react";

const BARS = [24, 42, 31, 58, 38, 68, 44, 57, 28, 49, 34, 62, 40];

export default function IntroAnimation({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2100);
    const doneTimer = window.setTimeout(onDone, 2660);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`intro-screen ${leaving ? "intro-screen--leaving" : ""}`} aria-label="AIJukebox introduction">
      <div className="intro-aurora intro-aurora--one" />
      <div className="intro-aurora intro-aurora--two" />

      <div className="intro-scene">
        <span className="intro-note intro-note--one" aria-hidden="true">♪</span>
        <span className="intro-note intro-note--two" aria-hidden="true">♫</span>
        <span className="intro-note intro-note--three" aria-hidden="true">♩</span>

        <div className="intro-orbit intro-orbit--outer" aria-hidden="true"><i /></div>
        <div className="intro-orbit intro-orbit--inner" aria-hidden="true"><i /></div>
        <div className="intro-rainbow-ring" aria-hidden="true" />

        <div className="intro-logo">
          <strong>AJ</strong>
        </div>

        <div className="intro-equalizer" aria-hidden="true">
          {BARS.map((height, index) => (
            <span key={index} style={{ height: `${height}px`, animationDelay: `${index * 70}ms` }} />
          ))}
        </div>
      </div>

      <div className="intro-title">
        <span className="intro-title__eyebrow text-purple-400">Tune into possibility</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-pink-400 to-white bg-clip-text text-transparent">
          Your AI Jukebox
        </span>
      </div>
    </div>
  );
}