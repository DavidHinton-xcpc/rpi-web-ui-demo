import { Check, ChevronRight, Loader2 } from "lucide-react";
import { type Language, type TranscriptRow } from "./data";

export function Mark({ large = false }: { large?: boolean }) {
  return (
    <div className={`brand-mark ${large ? "large" : ""}`} aria-hidden="true">
      <img
        className="rpi-logo"
        src="./favicon.svg"
        width={large ? 58 : 28}
        height={large ? 58 : 28}
        alt=""
      />
    </div>
  );
}

function TerminalIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}

function FileTextIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

/**
 * Mirrors ToolDisclosure in the real app: a quiet single-row activity line with
 * one chevron. Details are omitted because they are identical in both demos.
 */
export function ToolRow({
  row,
  language,
  labelDone,
  labelRunning,
}: {
  row: Extract<TranscriptRow, { kind: "tool" }>;
  language: Language;
  labelDone: string;
  labelRunning: string;
}) {
  const zh = language === "zh";
  const Icon = row.tool === "bash" ? TerminalIcon : FileTextIcon;
  return (
    <details className={`tool-card tool-${row.status}`}>
      <summary>
        <span className="tool-status">
          {row.status === "running" ? (
            <Loader2 size={14} className="spin" aria-hidden="true" />
          ) : (
            <Icon size={14} />
          )}
          <span className="sr-only">
            {row.status === "running" ? labelRunning : labelDone}
          </span>
        </span>
        <span className="tool-summary-text">
          <span className="tool-action">{row.tool}</span>
          {row.target && (
            <code className="tool-target" title={row.target}>
              {row.target}
            </code>
          )}
        </span>
        {row.elapsed && <span className="tool-elapsed">{row.elapsed}</span>}
        {row.status === "done" && <Check size={12} className="tool-success-mark" />}
        <ChevronRight size={14} className="tool-chevron" />
      </summary>
      <div className="tool-detail">
        <pre className="tool-result-pre">
          {zh ? "（演示中省略输出）" : "(output omitted in demo)"}
        </pre>
      </div>
    </details>
  );
}
