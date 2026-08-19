import { useState } from "react";
import { useLocalList } from "../hooks/useLocalList.js";
import ComparisonBar from "../components/ComparisonBar.jsx";

const toolKey = (tool) => tool._id || tool.name;

export default function SavedTools() {
  const savedTools = useLocalList("aijukebox:savedTools", { keyFn: toolKey });
  const recentlyUsed = useLocalList("aijukebox:recentlyUsed", { max: 30, keyFn: toolKey });
  const [compareIds, setCompareIds] = useState([]);
  const [compareTools, setCompareTools] = useState({});
  const toolsArray = savedTools.items;

  function handleToggleCompare(tool) {
    const key = toolKey(tool);
    setCompareIds((current) => current.includes(key) ? current.filter((id) => id !== key) : current.length < 3 ? [...current, key] : current);
    setCompareTools((current) => ({ ...current, [key]: tool }));
  }


  return (
    <div className="library-page saved-tools-page">
      <div className="library-atmosphere" aria-hidden="true"><span>✦</span><span>♪</span><span>·</span><span>✧</span></div>
      <div className="library-inner max-w-5xl">
        <div className="library-kicker">Your collection <span>★</span></div>
        <h1 className="library-title font-display">Saved Tools</h1>
        <p className="library-subtitle">Your personal AI collection.</p>

      {toolsArray.length === 0 ? (
        <div className="library-empty saved-empty">
          <div className="empty-album-mark" aria-hidden="true">★</div>
          <h2>Nothing saved yet</h2>
          <p>Save tools you love and build your AI collection.</p>
          <a href="/find" className="library-empty-cta focus-ring">Explore AI tools <span>→</span></a>
        </div>
      ) : (
        <div className="saved-tool-grid">
          {toolsArray.map((tool, index) => (
            <article
              key={tool?._id || tool?.name || index}
              className="saved-tool-card"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="saved-tool-top"><span className="saved-tool-logo">{tool.name.slice(0, 2).toUpperCase()}</span><span className="saved-tool-star">★ Saved</span></div>
              <h2>{tool.name}</h2>
              <p className="saved-tool-category">{tool.category}</p>
              <p className="saved-tool-description">{tool.description}</p>
              <div className="saved-tool-actions">
                <a href={tool.officialWebsiteUrl} target="_blank" rel="noopener noreferrer" onClick={() => recentlyUsed.push(tool)} className="saved-tool-open focus-ring">Open tool <span>→</span></a>
                <button type="button" onClick={() => savedTools.remove(tool)} className="saved-tool-remove focus-ring" aria-label={`Remove ${tool.name} from saved tools`}>Remove</button>
                <button type="button" onClick={() => handleToggleCompare(tool)} className="saved-tool-compare focus-ring">{compareIds.includes(toolKey(tool)) ? "Compared" : "Compare"}</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <ComparisonBar
        tools={compareIds.map((id) => compareTools[id]).filter(Boolean)}
        onRemove={handleToggleCompare}
        onClear={() => { setCompareIds([]); setCompareTools({}); }}
      />
      </div>
    </div>
  );
}