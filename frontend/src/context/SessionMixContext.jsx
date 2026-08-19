import { createContext, useCallback, useContext, useState } from "react";

const SessionMixContext = createContext(null);

export function SessionMixProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const addWorkflow = useCallback((result, query) => {
    const id = result.workflowId || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry = {
      id,
      query: query || result.query || result.userGoal || "Untitled AI workflow",
      result,
    };
    setEntries((current) => [...current.filter((item) => item.id !== id), entry]);
    setSelectedId(id);
    return id;
  }, []);

  const selectWorkflow = useCallback((id) => {
    setSelectedId(id);
  }, []);

  return (
    <SessionMixContext.Provider value={{ entries, selectedId, addWorkflow, selectWorkflow }}>
      {children}
    </SessionMixContext.Provider>
  );
}

export function useSessionMix() {
  const context = useContext(SessionMixContext);
  if (!context) throw new Error("useSessionMix must be used inside SessionMixProvider");
  return context;
}
