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
      <div className="intro-grain" />

      <div className="intro-scene">
        <div className="intro-wave intro-wave--top" aria-hidden="true">
          <svg viewBox="0 0 530 82" fill="none">
            <path d="M0 42C25 42 25 15 50 15S75 67 100 67s25-45 50-45 25 33 50 33 25-63 50-63 25 78 50 78 25-47 50-47 25 28 50 28 25-10 50-10 25 16 50 16" />
          </svg>
        </div>
        <div className="intro-wave intro-wave--bottom" aria-hidden="true">
          <svg viewBox="0 0 530 82" fill="none">
            <path d="M0 40c26 0 25 19 51 19 25 0 25-49 50-49s25 63 50 63 25-33 50-33 25 14 50 14 25-61 50-61 25 70 50 70 25-43 50-43 25 24 50 24 25-4 50-4 25 18 50 18" />
          </svg>
        </div>

        <span className="intro-note intro-note--one" aria-hidden="true">♪</span>
        <span className="intro-note intro-note--two" aria-hidden="true">♫</span>
        <span className="intro-note intro-note--three" aria-hidden="true">♪</span>

        <div className="intro-orbit intro-orbit--outer" aria-hidden="true"><i /></div>
        <div className="intro-orbit intro-orbit--inner" aria-hidden="true"><i /></div>
        <div className="intro-rainbow-ring" aria-hidden="true" />
        <div className="intro-rainbow-ring intro-rainbow-ring--soft" aria-hidden="true" />

        <div className="intro-logo">
          <span className="intro-logo__disc" />
          <span className="intro-logo__needle" />
          <strong>AJ</strong>
        </div>

        <div className="intro-equalizer" aria-hidden="true">
          {BARS.map((height, index) => (
            <span key={index} style={{ height: `${height}px`, animationDelay: `${index * 70}ms` }} />
          ))}
        </div>
      </div>

      <div className="intro-title">
        <span className="intro-title__eyebrow">Tune into possibility</span>
        <span>Your AI Jukebox</span>
      </div>
    </div>
  );
}
