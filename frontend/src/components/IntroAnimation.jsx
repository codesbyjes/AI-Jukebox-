import { useEffect, useState } from "react";

const PARTICLES = [
  [8, 4, 2, 0, "pink"], [15, 7, 3, 420, "violet"], [22, 5, 2, 780, "silver"],
  [29, 8, 4, 180, "purple"], [37, 6, 2, 960, "pink"], [44, 10, 3, 320, "violet"],
  [51, 5, 2, 640, "silver"], [58, 9, 3, 120, "pink"], [65, 6, 2, 540, "purple"],
  [72, 8, 4, 860, "violet"], [80, 5, 2, 260, "pink"], [89, 7, 3, 700, "silver"],
  [18, 12, 2, 1100, "pink"], [34, 11, 3, 1320, "purple"], [48, 13, 2, 1040, "violet"],
  [62, 12, 3, 1460, "pink"], [77, 11, 2, 1180, "silver"], [92, 13, 3, 1540, "purple"],
];

const EQUALIZER_BARS = [22, 38, 28, 52, 34, 64, 42, 58, 26, 46, 32, 56];

export default function IntroAnimation({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 2320);
    const doneTimer = window.setTimeout(onDone, 2840);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`intro-screen ${leaving ? "intro-screen--leaving" : ""}`} aria-label="AIJukebox powering on">
      <div className="intro-aurora intro-aurora--one" aria-hidden="true" />
      <div className="intro-aurora intro-aurora--two" aria-hidden="true" />
      <div className="intro-grain" aria-hidden="true" />
      <div className="intro-particles" aria-hidden="true">
        {PARTICLES.map(([left, size, drift, delay, color], index) => (
          <span
            key={index}
            className={`intro-particle intro-particle--${color}`}
            style={{ "--particle-left": `${left}%`, "--particle-size": `${size}px`, "--particle-drift": `${drift}px`, "--particle-delay": `${delay}ms` }}
          />
        ))}
      </div>

      <div className="intro-stage">
        <div className="intro-halo" aria-hidden="true" />
        <div className="intro-audio-ring intro-audio-ring--outer" aria-hidden="true" />
        <div className="intro-audio-ring intro-audio-ring--inner" aria-hidden="true" />
        <div className="intro-pulse" aria-hidden="true" />
        <div className="intro-logo">
          <strong>AJ</strong>
        </div>
        <div className="intro-equalizer" aria-hidden="true">
          {EQUALIZER_BARS.map((height, index) => (
            <span key={index} style={{ height: `${height}px`, animationDelay: `${index * 70}ms` }} />
          ))}
        </div>
        <div className="intro-title">
          <span>AIJukebox</span>
          <small>Tune your task. Find your AI.</small>
        </div>
      </div>
    </div>
  );
}