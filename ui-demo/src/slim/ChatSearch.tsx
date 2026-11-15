import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { type Language, projects, sessions } from "../data";

/**
 * Chat search: finds *sessions*, not messages inside one session.
 *
 * The original build's Settings advertises "Search chats — Ctrl / ⌘ K" but only
 * ships a message search (scoped to the open conversation), and never binds the
 * shortcut. This is the missing thing: one query across every project's session
 * titles, each hit selectable to jump straight there.
 *
 * Deliberately NOT the same as the recent-chats window: that one is recency
 * ordered and unfiltered, this one is query driven and shows archived matches
 * too (tagged), since a search should not silently hide them.
 */
export function ChatSearch({
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
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = sessions.map((session) => ({
      session,
      project: projects.find((p) => p.id === session.projectId)?.name ?? "",
    }));
    if (!q) {
      return [...rows]
        .sort((a, b) => b.session.updatedAt - a.session.updatedAt)
        .slice(0, 8);
    }
    return rows
      .filter(({ session, project }) => {
        // Title is the primary key; project name and tags let you narrow to a
        // project without leaving the keyboard.
        const haystack = [
          session.title,
          project,
          ...(session.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => b.session.updatedAt - a.session.updatedAt);
  }, [query]);

  useEffect(() => {
    input.current?.focus();
    input.current?.select();
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  // Keep the highlighted row inside the scroll box while arrowing.
  useEffect(() => {
    const node = list.current?.querySelector<HTMLElement>(
      `[data-index="${index}"]`,
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [index]);

  function commit(i: number) {
    const hit = results[i];
    if (!hit) return;
    onSelect(hit.session.id);
    onClose();
  }

  return (
    <div
      className="slim-chat-search"
      role="dialog"
      aria-modal="false"
      aria-label={zh ? "搜索会话" : "Search chats"}
    >
      <div className="slim-chat-search-field">
        <Search size={14} aria-hidden="true" />
        <input
          ref={input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={zh ? "搜索会话标题、项目或标签…" : "Search chat titles, projects or tags…"}
          aria-label={zh ? "搜索会话" : "Search chats"}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setIndex((i) => Math.min(results.length - 1, i + 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setIndex((i) => Math.max(0, i - 1));
            }
            if (event.key === "Enter") {
              event.preventDefault();
              commit(index);
            }
          }}
        />
        <button
          type="button"
          className="icon-button"
          aria-label={zh ? "关闭" : "Close"}
          onClick={onClose}
        >
          <X size={14} />
        </button>
      </div>

      <div className="slim-chat-search-list" ref={list} role="listbox">
        {results.length === 0 && (
          <p className="slim-chat-search-empty">
            {zh ? "没有匹配的会话。" : "No matching chats."}
          </p>
        )}
        {results.map(({ session, project }, i) => {
          const label = session.title || (zh ? "新会话" : "New session");
          return (
            <button
              key={session.id}
              type="button"
              role="option"
              data-index={i}
              aria-selected={i === index}
              className={`slim-chat-search-option${i === index ? " selected" : ""}`}
              onMouseMove={() => setIndex(i)}
              onClick={() => commit(i)}
            >
              <span className="slim-chat-search-copy">
                <strong>{label}</strong>
                <small>
                  {project}
                  {session.archived && ` · ${zh ? "已归档" : "archived"}`}
                  {session.running && ` · ${zh ? "运行中" : "running"}`}
                </small>
              </span>
              {(session.tags ?? []).slice(0, 2).map((tag) => (
                <span className="slim-chat-search-tag" key={tag}>
                  {tag}
                </span>
              ))}
              {session.id === activeId && <Check size={13} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <p className="slim-chat-search-foot">
        {query.trim()
          ? zh
            ? `${results.length} 个会话`
            : `${results.length} chat${results.length === 1 ? "" : "s"}`
          : zh
            ? "最近 8 个会话"
            : "8 most recent chats"}
        <span aria-hidden="true"> · </span>
        <kbd>↑</kbd>
        <kbd>↓</kbd>
        <span aria-hidden="true"> </span>
        <kbd>Enter</kbd>
      </p>
    </div>
  );
}
