import { useEffect, useState } from "react";

const STEPS = [
  "Understanding your task...",
  "Breaking it into stages...",
  "Searching AI tools...",
  "Ranking recommendations...",
  "Building your playlist...",
];

export default function ProcessingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 rounded-3xl bg-zinc-950/60 border border-purple-900/30 backdrop-blur-xl shadow-2xl">
      <div className="flex h-16 items-end gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-purple-600 via-pink-500 to-indigo-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
            style={{
              height: `${20 + ((i * 37) % 40)}px`,
              animation: `eqbar 1.1s ease-in-out ${i * 0.08}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-sm font-semibold tracking-wide text-purple-200 transition-opacity animate-pulse">
        {STEPS[stepIndex]}
      </p>
      <style>{`
        @keyframes eqbar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}