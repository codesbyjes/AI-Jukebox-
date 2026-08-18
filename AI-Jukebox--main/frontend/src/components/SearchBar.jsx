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
        className={`relative flex items-center gap-2 rounded-[1.35rem] border bg-surface p-2 shadow-card transition-all sm:gap-3 sm:p-2.5 ${
          focused ? "border-violet-300 shadow-glow" : "border-line"
        }`}
      >
        <span className="ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-rose-100 text-stage-video" aria-hidden="true">~</span>
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
          className="focus-ring min-w-0 flex-1 bg-transparent py-3 text-[15px] text-ink outline-none placeholder:text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Build an AI playlist"
          className="focus-ring grid h-11 shrink-0 place-items-center rounded-xl bg-rainbow px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale sm:px-5"
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
            className="focus-ring rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs text-muted transition-all hover:-translate-y-px hover:border-violet-200 hover:text-ink"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
