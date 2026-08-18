import { useState } from "react";

const SUGGESTIONS = [
  "Turn a PDF into a video",
  "Create a presentation",
  "Generate an image",
  "Convert text to voice",
];

export default function SearchBar({ onSubmit, disabled }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  function submit(event) {
    event?.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={submit}
        className={`relative flex items-center gap-2 rounded-2xl border bg-zinc-950/80 backdrop-blur-xl p-2 shadow-2xl transition-all duration-300 sm:gap-3 sm:p-2.5 ${
          focused ? "border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)]" : "border-purple-900/40"
        }`}
      >
        <span className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white font-bold text-sm shadow-[0_0_10px_rgba(236,72,153,0.5)]" aria-hidden="true">
          ♫
        </span>
        <label className="sr-only" htmlFor="goal-search">What do you want to create?</label>
        <input
          id="goal-search"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Describe what you want to make..."
          disabled={disabled}
          className="focus-ring min-w-0 flex-1 bg-transparent py-3 text-[15px] text-purple-100 outline-none placeholder:text-zinc-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Build an AI playlist"
          className="silver-btn focus-ring grid h-11 shrink-0 place-items-center rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale sm:px-5 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
        >
          <span className="hidden sm:inline">Build playlist</span>
          <span className="sm:hidden">Go</span>
        </button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setValue(suggestion)}
            className="focus-ring rounded-full border border-purple-900/40 bg-zinc-900/60 backdrop-blur-md px-3.5 py-1.5 text-xs text-purple-300/80 transition-all hover:-translate-y-0.5 hover:border-purple-500/50 hover:bg-purple-950/40 hover:text-white hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}