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
  const examples = [
    "📄 Research Paper → Video",
    "🎓 Notes → Presentation",
    "🎙️ Podcast → Shorts",
    "🚀 Idea → Pitch Deck",
  ];

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
    <div className="find-tool-page relative flex min-h-[calc(100vh-56px)] items-center justify-center overflow-hidden px-5 py-16 md:min-h-screen md:px-8">
      <div className="find-tool-cloud find-tool-cloud--one" />
      <div className="find-tool-cloud find-tool-cloud--two" />
      <div className="find-tool-cloud find-tool-cloud--three" />
      <div className="find-tool-staff find-tool-staff--one" />
      <div className="find-tool-staff find-tool-staff--two" />
      <div className="find-tool-notes" aria-hidden="true">
        <span className="find-tool-note find-tool-note--one">♪</span>
        <span className="find-tool-note find-tool-note--two">♫</span>
        <span className="find-tool-note find-tool-note--three">♩</span>
        <span className="find-tool-note find-tool-note--four">♬</span>
        <span className="find-tool-note find-tool-note--five">✦</span>
        <span className="find-tool-note find-tool-note--six">♪</span>
      </div>
      <div className="find-tool-stage" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-4xl text-center">
        {isLoading ? (
          <ProcessingState />
        ) : (
          <>
            <p className="find-tool-kicker">Find a Tool <span aria-hidden="true">✦</span></p>
            <h1 className="find-tool-title mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-tight">
              What do you want to make?
            </h1>
            <p className="find-tool-subtitle mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
              Tell us the goal. We'll remix it into the right <span>AI workflow</span>.
            </p>
            <div className="mt-10 flex w-full justify-center">
              <SearchBar onSubmit={handleSubmit} disabled={isLoading} />
            </div>
            {error && <p className="mx-auto mt-4 max-w-md text-sm text-pink-300">{error}</p>}
            <div className="find-tool-examples" aria-label="Try an example">
              <div className="find-tool-examples-heading">
                <span className="find-tool-examples-label">✦ Try an example</span>
                <span>See what AIJukebox can build from a simple goal.</span>
              </div>
              <div className="find-tool-example-list">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="find-tool-example-card focus-ring"
                    onClick={() => handleSubmit(example.replace(/^[^ ]+ /, "").replace(" → ", " to "))}
                  >
                    <span className="find-tool-example-tag">Try this</span>
                    <span>{example}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
