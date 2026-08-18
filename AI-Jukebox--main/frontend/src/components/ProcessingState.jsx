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
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <div className="flex h-16 items-end gap-1.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-[#3E6BFF] via-[#8B5CF6] to-[#FF4D9E]"
            style={{
              height: `${20 + ((i * 37) % 40)}px`,
              animation: `eqbar 1.1s ease-in-out ${i * 0.08}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-muted transition-opacity">{STEPS[stepIndex]}</p>
      <style>{`
        @keyframes eqbar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
