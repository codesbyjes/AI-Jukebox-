import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeTask } from "../api/client.js";
import ProcessingState from "../components/ProcessingState.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { useLocalList } from "../hooks/useLocalList.js";

export default function FindTool() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const recentSearches = useLocalList("aijukebox:recentSearches", {
    max: 12,
    keyFn: (item) => item.query,
  });

  async function handleSubmit(query) {
    setError(null);
    setIsLoading(true);
    try {
      const result = await analyzeTask(query);
      recentSearches.push({
        query,
        workflowId: result.workflowId,
        stageCount: result.stages?.length ?? 0,
        result,
      });
      navigate("/results", { state: { result } });
    } catch (requestError) {
      setError(requestError.message || "AIJukebox could not process that request.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden px-5 py-16 md:min-h-screen md:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="relative w-full max-w-3xl text-center">
        {isLoading ? (
          <ProcessingState />
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-purple-400">Find a Tool</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-tight">
              What are you trying to accomplish?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Describe the outcome and <span className="brand-wordmark">AIJukebox</span> will build the workflow around it.
            </p>
            <div className="mt-10 flex w-full justify-center">
              <SearchBar onSubmit={handleSubmit} disabled={isLoading} />
            </div>
            {error && <p className="mx-auto mt-4 max-w-md text-sm text-pink-300">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
