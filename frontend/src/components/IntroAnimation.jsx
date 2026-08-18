import { useEffect, useState } from "react";
import AJLogo from "./AJLogo.jsx";

const PARTICLES = [
  [8, 4, 2, 0, "pink", 4.8], [15, 7, 3, 420, "violet", 5.6], [22, 5, 2, 780, "silver", 4.2],
  [29, 8, 4, 180, "purple", 6.2], [37, 6, 2, 960, "pink", 5.1], [44, 10, 3, 320, "violet", 6.6],
  [51, 5, 2, 640, "silver", 4.6], [58, 9, 3, 120, "pink", 5.8], [65, 6, 2, 540, "purple", 4.9],
  [72, 8, 4, 860, "violet", 6.1], [80, 5, 2, 260, "pink", 4.4], [89, 7, 3, 700, "silver", 5.4],
  [18, 12, 2, 1100, "pink", 6.8], [34, 11, 3, 1320, "purple", 5.3], [48, 13, 2, 1040, "violet", 6.5],
  [62, 12, 3, 1460, "pink", 5.7], [77, 11, 2, 1180, "silver", 4.7], [92, 13, 3, 1540, "purple", 6.3],
  [5, 9, 2, 1760, "violet", 5.2], [12, 6, 3, 1980, "pink", 6.7], [26, 10, 2, 1880, "purple", 5.9],
  [41, 7, 3, 2160, "silver", 4.5], [55, 9, 2, 1840, "pink", 6.4], [69, 6, 3, 2260, "violet", 5.5],
  [84, 10, 2, 2040, "purple", 6.9], [96, 7, 3, 2360, "pink", 5.1], [31, 5, 2, 2520, "silver", 4.8],
  [73, 8, 2, 2680, "violet", 6.2], [46, 6, 3, 2440, "pink", 5.6], [88, 5, 2, 2780, "purple", 4.6],
];

const EQUALIZER_BARS = [22, 38, 28, 52, 34, 64, 42, 58, 26, 46, 32, 56];

export default function IntroAnimation({ onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveDelay = reducedMotion ? 520 : 6100;
    const doneDelay = reducedMotion ? 900 : 6900;
    const leaveTimer = window.setTimeout(() => setLeaving(true), leaveDelay);
    const doneTimer = window.setTimeout(onDone, doneDelay);
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
        {PARTICLES.map(([left, size, drift, delay, color, duration], index) => (
          <span
            key={index}
            className={`intro-particle intro-particle--${color}`}
            style={{ "--particle-left": `${left}%`, "--particle-size": `${size}px`, "--particle-drift": `${drift}px`, "--particle-delay": `${delay}ms`, "--particle-duration": `${duration}s` }}
          />
        ))}
      </div>

      <div className="intro-stage">
        <div className="intro-logo-stage">
          <div className="intro-halo" aria-hidden="true" />
          <div className="intro-audio-ring intro-audio-ring--outer" aria-hidden="true" />
          <div className="intro-audio-ring intro-audio-ring--inner" aria-hidden="true" />
          <div className="intro-pulse" aria-hidden="true" />
          <div className="intro-logo-circle">
            <div className="intro-logo-inner">
              <AJLogo className="intro-logo-mark" />
            </div>
          </div>
        </div>
        <div className="intro-copy">
          <div className="intro-title">
            <span className="brand-wordmark">AIJukebox</span>
            <small>Tune your task. Find your AI.</small>
          </div>
          <div className="intro-equalizer" aria-hidden="true">
            {EQUALIZER_BARS.map((height, index) => (
              <span key={index} style={{ height: `${height}px`, animationDelay: `${index * 70}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}