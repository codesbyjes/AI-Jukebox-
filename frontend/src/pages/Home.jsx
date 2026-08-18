import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeTask } from "../api/client.js";
import ProcessingState from "../components/ProcessingState.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useLocalList } from "../hooks/useLocalList.js";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const recentSearches = useLocalList("aijukebox:recentSearches", {
    max: 12,
    keyFn: (item) => item.query,
  });

  async function handleSubmit(query) {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeTask(query);
      // Retaining the response makes recent tasks reopenable in local/demo mode
      // as well as when MongoDB workflow persistence is enabled.
      recentSearches.push({
        query,
        workflowId: result.workflowId,
        stageCount: result.stages?.length ?? 0,
        result,
      });
      navigate("/results", { state: { result } });
    } catch (requestError) {
      setError(requestError.message || "AIJukebox couldn't process that request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-56px)] flex-col items-center justify-center overflow-hidden px-5 py-20 md:min-h-screen md:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-indigo-100/65 via-rose-100/35 to-amber-100/55 blur-3xl" />
      <div className="relative w-full max-w-3xl text-center">
        {!loading ? (
          <>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-stage-audio shadow-[0_0_10px_#ff4d9e]" />
              Your creative signal
            </div>
            <h1 className="font-display text-4xl leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-6xl">
              What do you want to <span className="rainbow-text">create?</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              Say the goal in your own words. We will turn it into a simple AI playlist of stages and real tools.
            </p>
            <div className="mt-10 flex w-full flex-col items-center">
              <SearchBar onSubmit={handleSubmit} disabled={loading} />
            </div>
            {error && <p className="mx-auto mt-4 max-w-md text-sm text-rose-600">{error}</p>}
            <p className="mt-7 text-xs text-muted">One goal in. Your next creative workflow out.</p>
          </>
        ) : (
          <ProcessingState />
        )}
      </div>
    </div>
  );
}
