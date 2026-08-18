import { useState } from "react";
import { useLocalList } from "../hooks/useLocalList.js";
import ToolCard from "../components/ToolCard.jsx";

const toolKey = (tool) => tool._id || tool.name;

export default function SavedTools() {
  const savedTools = useLocalList("aijukebox:savedTools", { keyFn: toolKey });
  const recentlyUsed = useLocalList("aijukebox:recentlyUsed", { max: 30, keyFn: toolKey });
  const [compareIds, setCompareIds] = useState([]);
  const toolsArray = savedTools.items;

  function handleToggleCompare(tool) {
    const key = toolKey(tool);
    setCompareIds((current) => current.includes(key) ? current.filter((id) => id !== key) : current.length < 3 ? [...current, key] : current);
  }


  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 border-b border-purple-900/30 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-900/40 text-lg text-pink-400 border border-purple-700/30 shadow-md">
            ★
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Saved AI Tools</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Your personal collection of bookmarked AI software.</p>
          </div>
        </div>
      </div>

      {toolsArray.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-purple-900/40 bg-zinc-950/50 p-12 text-center backdrop-blur-xl">
          <span className="text-4xl mb-3">🎵</span>
          <p className="text-base font-semibold text-purple-200">No saved tools yet</p>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm">
            Click the star icon on any tool card while exploring playlists to save tools to your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {toolsArray.map((tool, index) => (
            <ToolCard
              key={tool?._id || tool?.name || index}
              entry={{ tool, score: 1, explanation: "Saved in your library" }}
              index={index}
              isSaved={true}
              onToggleSave={savedTools.toggle}
              onVisit={recentlyUsed.push}
              compareSelected={compareIds.includes(tool?._id || tool?.name)}
              onToggleCompare={handleToggleCompare}
              compareDisabled={compareIds.length >= 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}