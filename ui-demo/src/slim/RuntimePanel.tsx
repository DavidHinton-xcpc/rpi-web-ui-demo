import { useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { type Language, models, supports } from "../data";

const THINKING_LEVELS = ["off", "low", "medium", "high", "max"];

/** Tool catalog shown in the runtime panel, mirroring the host's list. */
const TOOL_CATALOG = [
  "read",
  "bash",
  "edit",
  "write",
  "docs",
  "durable",
  "websearch",
  "webfetch",
];

/**
 * The full runtime panel, matching the original build section for section:
 *
 *   read-aloud toggle · manage providers · model · thinking level ·
 *   context meter (with compaction note) · per-tool enable checkboxes
 *
 * The slim variant keeps this panel intact. What changed is only *where you
 * open it from*: the entry sits at the top of the composer's model menu, since
 * choosing a model and reading its context/tool state are one concern. The
 * duplicate model/thinking dropdowns were the thing worth removing, not the
 * panel's diagnostics.
 */
export function RuntimePanelBody({
  language,
  model,
  onModel,
}: {
  language: Language;
  model: string;
  onModel: (id: string) => void;
}) {
  const zh = language === "zh";
  const [thinking, setThinking] = useState("max");
  const [autoRead, setAutoRead] = useState(true);
  const [active, setActive] = useState<Set<string>>(
    () => new Set(["read", "bash", "edit", "write", "docs", "durable"]),
  );
  const [modelOpen, setModelOpen] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(false);

  const percent = supports.contextPercent;
  // Compaction threshold from the host; the demo reports the same numbers the
  // original panel prints.
  const compactsPast = "984k";
  const keeps = "20k";

  function toggleTool(tool: string) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(tool)) next.delete(tool);
      else next.add(tool);
      return next;
    });
  }

  return (
    <>
      <label className="settings-toggle">
        <input
          type="checkbox"
          checked={autoRead}
          onChange={(event) => setAutoRead(event.target.checked)}
        />
        <span>{zh ? "朗读新回复" : "Read new replies aloud"}</span>
      </label>

      <button type="button" className="provider-manager-entry">
        <ShieldCheck size={14} aria-hidden="true" />
        {zh ? "管理供应商" : "Manage providers"}
      </button>

      <label htmlFor="slim-rt-model">{zh ? "模型" : "Model"}</label>
      <div className="select-menu" data-menu-select="true">
        <button
          type="button"
          className="select-menu-trigger"
          id="slim-rt-model"
          aria-haspopup="listbox"
          aria-expanded={modelOpen}
          onClick={() => {
            setModelOpen((v) => !v);
            setThinkingOpen(false);
          }}
        >
          <span className="select-menu-value">{model}</span>
          <ChevronDown size={14} className="select-menu-chevron" />
        </button>
        {modelOpen && (
          <div className="dropdown-popover slim-rt-popover" role="listbox">
            {models.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="option"
                aria-selected={entry.id === model}
                className="dropdown-item"
                onClick={() => {
                  onModel(entry.id);
                  setModelOpen(false);
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="muted">{zh ? "上下文 1000k" : "Context 1000k"}</p>

      <label htmlFor="slim-rt-thinking">
        {zh ? "思考深度" : "Thinking level"}
      </label>
      <div className="select-menu" data-menu-select="true">
        <button
          type="button"
          className="select-menu-trigger"
          id="slim-rt-thinking"
          aria-haspopup="listbox"
          aria-expanded={thinkingOpen}
          onClick={() => {
            setThinkingOpen((v) => !v);
            setModelOpen(false);
          }}
        >
          <span className="select-menu-value">{thinking}</span>
          <ChevronDown size={14} className="select-menu-chevron" />
        </button>
        {thinkingOpen && (
          <div className="dropdown-popover slim-rt-popover" role="listbox">
            {THINKING_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                role="option"
                aria-selected={level === thinking}
                className="dropdown-item"
                onClick={() => {
                  setThinking(level);
                  setThinkingOpen(false);
                }}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      <h3 className="panel-heading">{zh ? "上下文" : "Context"}</h3>
      <div
        className="context-bar"
        title={`${supports.contextTokens} / ${supports.contextWindow}`}
      >
        <span className="context-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="muted">
        {supports.contextTokens} / {supports.contextWindow} · {percent}%
      </p>
      <p className="muted">
        {zh
          ? `超过 ${compactsPast} 时压缩 · 保留 ${keeps}`
          : `compacts past ${compactsPast} · keeps ${keeps}`}
      </p>

      <h3 className="panel-heading">{zh ? "启用的工具" : "Active tools"}</h3>
      <div className="tool-stack">
        {TOOL_CATALOG.map((tool) => (
          <label key={tool} className="stat-row slim-tool-row">
            <span>{tool}</span>
            <input
              type="checkbox"
              checked={active.has(tool)}
              onChange={() => toggleTool(tool)}
            />
          </label>
        ))}
      </div>
    </>
  );
}
