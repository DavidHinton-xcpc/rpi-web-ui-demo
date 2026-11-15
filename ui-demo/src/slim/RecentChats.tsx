import { useEffect, useRef } from "react";
import { Check, Clock3, X } from "lucide-react";
import { type Language, projects, sessions } from "../data";

/**
 * The slim variant's "Recent chats" entry.
 *
 * The original renders Recent chats as a permanent in-sidebar block whose
 * entries duplicate the project tree 1:1, plus a "More" toggle that only
 * scrolls a fixed-height box. Here the same content is a small floating window
 * (same chrome as the message-search card): it costs no permanent vertical
 * space, so the project tree gets all of it, and the redundancy is paid for
 * only while the window is open.
 *
 * Window + list styling mirrors the search popover; the list itself is the
 * cross-project recency view, which is the one thing the tree cannot express.
 */
export function RecentChats({
  language,
  activeId,
  onSelect,
  onClose,
}: {
  language: Language;
  activeId: string;
  onSelect: (sessionId: string) => void;
  onClose: () => void;
}) {
  const zh = language === "zh";
  const box = useRef<HTMLDivElement>(null);

  const recent = [...sessions]
    .filter((session) => !session.archived)
    .sort(
      (a, b) =>
        Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
        b.updatedAt - a.updatedAt,
    );

  useEffect(() => {
    const input = box.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      // The open/close trigger lives outside this window; without this the
      // document handler would close it and the click would immediately
      // reopen it, making the button appear dead.
      if (target.closest(".slim-recent") || target.closest(".slim-search")) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={box}
      className="slim-recent"
      role="dialog"
      aria-label={zh ? "最近会话" : "Recent chats"}
    >
      <div className="slim-recent-heading">
        <span>
          <Clock3 size={13} aria-hidden="true" />
          {zh ? "最近会话" : "Recent chats"}
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label={zh ? "关闭" : "Close"}
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>
      <div className="slim-recent-list">
        {recent.map((session) => {
          const project = projects.find((p) => p.id === session.projectId);
          const label = session.title || (zh ? "新会话" : "New session");
          const selected = session.id === activeId;
          return (
            <button
              key={session.id}
              type="button"
              className={`slim-recent-option${selected ? " selected" : ""}`}
              aria-current={selected ? "true" : undefined}
              onClick={() => {
                onSelect(session.id);
                onClose();
              }}
            >
              {session.awaiting ? (
                <span className="session-answer-dot" aria-hidden="true" />
              ) : session.running ? (
                <span className="session-running-dot" aria-hidden="true" />
              ) : (
                <span className="session-indent-dot" aria-hidden="true" />
              )}
              <span className="slim-recent-title">{label}</span>
              <span className="slim-recent-project">{project?.name}</span>
              {selected && <Check size={13} aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
