import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeTask } from "../api/client.js";
import ProcessingState from "../components/ProcessingState.jsx";
import SearchBar, { EXAMPLE_PROMPTS } from "../components/SearchBar.jsx";
import { useLocalList } from "../hooks/useLocalList.js";
import { useSessionMix } from "../context/SessionMixContext.jsx";

export default function FindTool() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInvalidTaskModal, setShowInvalidTaskModal] = useState(false);
  const [isClosingInvalidTaskModal, setIsClosingInvalidTaskModal] = useState(false);
  const { addWorkflow } = useSessionMix();
  const recentSearches = useLocalList("aijukebox:recentSearches", {
    max: 12,
    keyFn: (item) => item.query,
  });
  async function handleSubmit(query) {
    setError(null);
    setShowInvalidTaskModal(false);
    setIsLoading(true);
    try {
      const result = await analyzeTask(query);
      recentSearches.push({
        query,
        workflowId: result.workflowId,
        stageCount: result.stages?.length ?? 0,
        result,
      });
      const mixId = addWorkflow(result, query);
      navigate("/results", { state: { result, mixId } });
    } catch (requestError) {
      if (requestError.code === "INVALID_TASK") {
        setIsClosingInvalidTaskModal(false);
        setShowInvalidTaskModal(true);
      } else {
        setError(requestError.message || "AIJukebox could not process that request.");
      }
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
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example.query}
                    type="button"
                    className="find-tool-example-card focus-ring"
                    onClick={() => handleSubmit(example.query)}
                  >
                    <span className="find-tool-example-tag">Try this</span>
                    <span>{example.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {showInvalidTaskModal && (
        <div className={`invalid-task-modal-backdrop ${isClosingInvalidTaskModal ? "invalid-task-modal-backdrop--closing" : ""}`} role="presentation">
          <div className={`invalid-task-modal ${isClosingInvalidTaskModal ? "invalid-task-modal--closing" : ""}`} role="alertdialog" aria-modal="true" aria-labelledby="invalid-task-title">
            <p id="invalid-task-title" className="invalid-task-modal-title">Sorry, I wasn't able to understand your request.</p>
            <p className="invalid-task-modal-message">Please try using different wording.</p>
            <button
              type="button"
              className="invalid-task-modal-button focus-ring"
              onClick={() => {
                setIsClosingInvalidTaskModal(true);
                window.setTimeout(() => {
                  setShowInvalidTaskModal(false);
                  setIsClosingInvalidTaskModal(false);
                }, 180);
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
