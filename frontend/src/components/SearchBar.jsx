import { useEffect, useState } from "react";

export const EXAMPLE_PROMPTS = [
  { label: "📄 Research paper → YouTube video", query: "Turn my research paper into a polished 5-minute YouTube video" },
  { label: "🎓 Lecture notes → study kit", query: "Turn my lecture notes into a study guide, quiz and flashcards" },
  { label: "🎙️ Podcast idea → full episode", query: "Turn a podcast idea into a full episode with script, voice and video" },
  { label: "🚀 Business idea → launch plan", query: "Turn my business idea into a pitch deck, website and marketing plan" },
];

const PLACEHOLDERS = [
  "Turn my research paper into a polished 5-minute YouTube video...",
  "Create a complete social media campaign for my college event...",
  "Turn my lecture notes into a study guide, quiz and flashcards...",
  "Turn my product idea into a brand, landing page and launch campaign...",
  "Create a short documentary from my research and source material...",
];

export default function SearchBar({ onSubmit, disabled }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (value) return undefined;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % PLACEHOLDERS.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [value]);

  function submit(event) {
    event?.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  }

  return (
    <div className={`find-tool-search w-full max-w-3xl ${focused ? "find-tool-search--focused" : ""}`}>
      <form
        onSubmit={submit}
        className={`find-tool-search-form relative flex items-center gap-2 rounded-2xl border p-2 shadow-2xl transition-all duration-300 sm:gap-3 sm:p-2.5 ${
          focused
            ? "border-pink-400/70"
            : "border-pink-200/20"
        }`}
      >
        <span
          className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold text-sm shadow-[0_0_10px_rgba(236,72,153,0.5)]"
          aria-hidden="true"
        >
          ♫
        </span>
        <label className="sr-only" htmlFor="goal-search">
          What do you want to create?
        </label>
        <input
          id="goal-search"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDERS[placeholderIndex]}
          disabled={disabled}
          className="focus-ring min-w-0 flex-1 bg-transparent py-3 text-[15px] text-rose-50 outline-none placeholder:text-rose-100/45 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="REMIX MY GOAL"
          className="find-tool-submit silver-btn focus-ring grid h-11 shrink-0 place-items-center rounded-xl px-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale sm:px-5"
        >
          <span>REMIX MY GOAL <span aria-hidden="true">✦</span></span>
        </button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {EXAMPLE_PROMPTS.map((suggestion) => (
          <button
            key={suggestion.query}
            type="button"
            onClick={() => {
              setValue(suggestion.query);
              onSubmit(suggestion.query);
            }}
            className="find-tool-chip focus-ring rounded-full px-3.5 py-1.5 text-xs transition-all hover:-translate-y-0.5"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="find-tool-surprise focus-ring mt-5"
        onClick={() => onSubmit(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)].replace("...", ""))}
        disabled={disabled}
      >
        ✦ Show me an example
      </button>
      <p className="find-tool-surprise-hint">Not sure what to try? Pick a sample goal.</p>
    </div>
  );
}