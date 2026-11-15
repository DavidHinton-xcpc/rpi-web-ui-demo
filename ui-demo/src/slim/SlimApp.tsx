import { useEffect, useState } from "react";
import {
  Archive,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Folder,
  GitBranch,
  Maximize2,
  Minus,
  MoreHorizontal,
  PanelLeft,
  Paperclip,
  Pin,
  Plus,
  Search,
  Clock3,
  Database,
  Gauge,
  GitBranch as ForkIcon,
  ListOrdered,
  Settings2,
  SquarePen,
  Sun,
  Moon,
} from "lucide-react";
import { type Language, models, projects, sessions, supports, transcript } from "../data";
import { Mark, ToolRow } from "../shared";
import { RecentChats } from "./RecentChats";
import { MessageSearchPopover, TimelineRail } from "../native/NativePanels";
import { ModelMenu } from "./ModelMenu";
import "./slim.css";

/**
 * The slim variant. Same data, same stylesheet, but the chrome is reduced to
 * what each control actually does:
 *
 *  - one entry point per action (new session, new project, settings)
 *  - no duplicated recent-chats list (the project tree already contains them)
 *  - no dead controls (fake avatar, refresh, "workspace user", preview badge)
 *  - appearance + language live only in Settings
 *  - one right-hand rail button per panel, panels are mutually exclusive
 *
 * Classes marked `slim-*` are additions; everything else reuses the stock
 * stylesheet so the two modes are visually comparable.
 */
export function SlimApp({
  language,
  onLanguage,
  dark,
  onDark,
}: {
  language: Language;
  onLanguage: (value: Language) => void;
  dark: boolean;
  onDark: (value: boolean) => void;
}) {
  const zh = language === "zh";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [projectDialog, setProjectDialog] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(["screen", "task"]),
  );
  const [activeId, setActiveId] = useState("s1");
  const [activeProject, setActiveProject] = useState("rpi-web");
  const [panel, setPanel] = useState<"" | "trace" | "files" | "runtime">("");
  const [recentOpen, setRecentOpen] = useState(false);
  // Timeline and message search are independent overlays in the original too;
  // only the right-hand rail is exclusive.
  const [timelineOpen, setTimelineOpen] = useState(false);
  // Restored from the original: archive view, immersive mode, message search.
  const [showArchived, setShowArchived] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);
  const [model, setModel] = useState(models[0].id);

  // Ctrl / ⌘ K is advertised in Settings; here it actually opens the recent
  // chats window instead of doing nothing.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "k") {
        event.preventDefault();
        setRecentOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Archived is a filter over the same tree, not a separate list: the heading
  // says which set you are looking at and the toggle flips it.
  const visible = sessions.filter((s) => Boolean(s.archived) === showArchived);
  const ordered = [...visible].sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
      b.updatedAt - a.updatedAt,
  );
  const current = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const projectsShown = projects.filter((project) =>
    ordered.some((s) => s.projectId === project.id),
  );
  const archivedCount = sessions.filter((s) => s.archived).length;

  return (
    <div
      className={`workspace slim${immersive ? " workspace--immersive" : ""}${dark ? " demo-dark" : ""}`}
      data-slim
    >
      {!immersive && <aside className="sidebar open">
        <div className="sidebar-brand">
          <Mark /> <span>rpi</span>
        </div>

        <div className="project-navigation">
          {/* Single primary action. The project-row "+" (below, on hover) is the
              per-project shortcut; this one uses the active project. */}
          <div className="sidebar-primary-actions">
            <button className="sidebar-new-chat">
              <SquarePen size={16} />
              <span>{zh ? "新建会话" : "New session"}</span>
              <kbd>Ctrl N</kbd>
            </button>
            {/* Recent chats, but as a small floating window instead of a
                permanent block that duplicates the project tree 1:1. The whole
                vertical space goes to the tree; the window is opt-in. */}
            <button
              className={`sidebar-new-chat slim-search${recentOpen ? " active" : ""}`}
              aria-expanded={recentOpen}
              onClick={() => setRecentOpen((open) => !open)}
            >
              <Clock3 size={16} />
              <span>{zh ? "最近会话" : "Recent chats"}</span>
              <kbd>Ctrl K</kbd>
            </button>
          </div>

          <div className="project-section-heading">
            <span>{showArchived ? (zh ? "已归档" : "Archived") : zh ? "项目" : "Projects"}</span>
            {/* Restored: the archive view filters this same tree in place, so it
                lives on the section heading rather than in a separate screen. */}
            <div>
              <button
                className={`icon-button ${showArchived ? "selected" : ""}`}
                aria-label={
                  showArchived
                    ? zh ? "返回项目" : "Show projects"
                    : zh ? "查看已归档" : "Show archived chats"
                }
                title={
                  showArchived
                    ? zh ? "已归档项目和会话" : "Archived projects and chats"
                    : zh ? "查看已归档项目和会话" : "Show archived projects and chats"
                }
                aria-pressed={showArchived}
                onClick={() => setShowArchived((v) => !v)}
              >
                <span className="slim-icon-wrap">
                  <Archive size={14} />
                  {archivedCount > 0 && !showArchived && (
                    <span className="slim-badge-count">{archivedCount}</span>
                  )}
                </span>
              </button>
              {!showArchived && (
                <button
                  className="icon-button"
                  aria-label={zh ? "新建项目" : "New project"}
                  title={zh ? "新建项目" : "New project"}
                  onClick={() => setProjectDialog(true)}
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          <nav
            className="project-tree slim-tree"
            aria-label={zh ? "项目与会话" : "Projects and chats"}
          >
            {projectsShown.map((project) => {
              const chats = ordered.filter((s) => s.projectId === project.id);
              const expanded = !collapsed.has(project.id);
              const isActiveProject = project.id === activeProject;
              return (
                <section
                  key={project.id}
                  className={`project-group ${isActiveProject ? "selected-project" : ""}`}
                  aria-label={project.name}
                >
                  <div className="project-group-header">
                    <button
                      className="icon-button project-collapse"
                      aria-label={`${expanded ? (zh ? "折叠项目" : "Collapse project") : zh ? "展开项目" : "Expand project"}: ${project.name}`}
                      aria-expanded={expanded}
                      onClick={() =>
                        setCollapsed((prev) => {
                          const next = new Set(prev);
                          if (next.has(project.id)) next.delete(project.id);
                          else next.add(project.id);
                          return next;
                        })
                      }
                    >
                      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    {/* One click target for the whole row: select + expand. The
                        separate collapse chevron stays for keyboard/expand-only
                        use, but the name no longer toggles a different state
                        than it selects. */}
                    <button
                      className="project-name"
                      title={project.path}
                      aria-expanded={expanded}
                      onClick={() => {
                        setActiveProject(project.id);
                        setCollapsed((prev) => {
                          const next = new Set(prev);
                          next.delete(project.id);
                          return next;
                        });
                        const first = chats[0];
                        if (first) setActiveId(first.id);
                      }}
                    >
                      <Folder size={15} />
                      <span>{project.name}</span>
                      <span className="slim-project-count">{chats.length}</span>
                    </button>
                    <button
                      className="icon-button project-new-session"
                      aria-label={`${zh ? "项目内新建会话" : "New session in"}: ${project.name}`}
                      title={zh ? "项目内新建会话" : "New session in project"}
                      onClick={() => {
                        setActiveProject(project.id);
                        setCollapsed((prev) => {
                          const next = new Set(prev);
                          next.delete(project.id);
                          return next;
                        });
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="project-chats">
                      {chats.map((session) => (
                        <SlimSessionRow
                          key={session.id}
                          language={language}
                          session={session}
                          active={session.id === activeId}
                          onSelect={() => {
                            setActiveId(session.id);
                            setActiveProject(session.projectId);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </nav>
        </div>

        {/* One footer row: the single place where workspace-level settings live.
            No avatar block, no language dropdown, no refresh button, no
            preview badge, no duplicate runtime entry. */}
        <div className="sidebar-bottom slim-bottom">
          <button
            className="slim-settings"
            onClick={() => setSettingsOpen(true)}
            title={zh ? "设置" : "Settings"}
          >
            <Settings2 size={14} />
            <span>{zh ? "设置" : "Settings"}</span>
            <kbd>Ctrl ,</kbd>
          </button>
        </div>
      </aside>}

      {!immersive && (
        <div className="workspace-splitter" role="separator" aria-orientation="vertical" />
      )}

      <section className="main-shell">
        {immersive && (
          <button
            type="button"
            className="icon-button immersive-exit"
            aria-label={zh ? "退出沉浸式查看" : "Exit immersive view"}
            title={zh ? "退出沉浸式查看" : "Exit immersive view"}
            onClick={() => setImmersive(false)}
          >
            <Minus size={17} aria-hidden="true" />
          </button>
        )}
        <header className="toolbar">
          <div className="toolbar-left">
            <button className="icon-button" aria-label={zh ? "切换侧边栏" : "Toggle sidebar"}>
              <PanelLeft size={17} />
            </button>
            <div className="breadcrumb">
              <span className="breadcrumb-project">
                {projects.find((p) => p.id === activeProject)?.name}
              </span>
              <span className="breadcrumb-separator" aria-hidden="true">
                ·
              </span>
              <h1 title={current.title}>{current.title}</h1>
            </div>
          </div>
          {/* Kept: fork, clone, timeline, then the three exclusive panels.
              Dropped: immersive view (the sidebar toggle already collapses the
              chrome) and message search (moved to the Recent-chats window's
              sibling shortcut, Ctrl / ⌘ K). */}
          <div className="toolbar-actions">
            {/* Restored from the original: immersive reading mode and message
                search. Immersive is a mode (stays pressed, hides the chrome),
                search is an overlay that can sit alongside a panel. */}
            <button
              type="button"
              className={`icon-button ${immersive ? "selected" : ""}`}
              aria-label={zh ? "沉浸式查看" : "Immersive view"}
              title={zh ? "沉浸式查看" : "Immersive view"}
              aria-pressed={immersive}
              onClick={() => setImmersive((v) => !v)}
            >
              {immersive ? <Minus size={17} /> : <Maximize2 size={17} />}
            </button>
            <button
              type="button"
              className={`icon-button ${messageSearchOpen ? "selected" : ""}`}
              aria-label={zh ? "搜索消息" : "Search messages"}
              title={zh ? "搜索消息" : "Search messages"}
              aria-pressed={messageSearchOpen}
              onClick={() => setMessageSearchOpen((v) => !v)}
            >
              <Search size={17} />
            </button>
            <button
              type="button"
              className="icon-button toolbar-fork"
              aria-label={zh ? "分叉当前会话" : "Fork current session"}
              title={zh ? "分叉当前会话" : "Fork current session"}
            >
              <ForkIcon size={16} />
            </button>
            <button
              type="button"
              className="icon-button toolbar-clone"
              aria-label={zh ? "克隆当前会话" : "Clone current session"}
              title={zh ? "克隆当前会话" : "Clone current session"}
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              className={`icon-button ${timelineOpen ? "selected" : ""}`}
              aria-label={zh ? "会话时间轴" : "Conversation timeline"}
              title={zh ? "会话时间轴" : "Conversation timeline"}
              aria-pressed={timelineOpen}
              aria-controls="conversation-timeline-navigation"
              onClick={() => setTimelineOpen((open) => !open)}
            >
              <ListOrdered size={17} />
            </button>
            <button
              className={`icon-button ${panel === "trace" ? "selected" : ""}`}
              aria-label={zh ? "执行轨迹" : "Execution trace"}
              title={zh ? "执行轨迹" : "Execution trace"}
              aria-pressed={panel === "trace"}
              onClick={() => setPanel(panel === "trace" ? "" : "trace")}
            >
              <TraceIcon />
            </button>
            <button
              className={`icon-button ${panel === "files" ? "selected" : ""}`}
              aria-label={zh ? "项目文件" : "Project files"}
              title={zh ? "项目文件" : "Project files"}
              aria-pressed={panel === "files"}
              onClick={() => setPanel(panel === "files" ? "" : "files")}
            >
              <FilesIcon />
            </button>
          </div>
        </header>

        <main className="main-content chat-layout">
          <div className="conversation-column">
            <div className="transcript-frame">
              {messageSearchOpen && <MessageSearchPopover language={language} />}
              {timelineOpen && <TimelineRail language={language} />}
              <div className="transcript">
                <div className="message-list">
                  {transcript.map((row) =>
                    row.kind === "tool" ? (
                      <div className="transcript-row" key={row.id}>
                        <ToolRow
                          row={row}
                          language={language}
                          labelDone={zh ? "已完成" : "done"}
                          labelRunning={zh ? "运行中" : "running"}
                        />
                      </div>
                    ) : (
                      <div className="transcript-row" key={row.id}>
                        <article
                          className={`message ${row.kind === "user" ? "user" : "assistant"}`}
                        >
                          <div className="message-heading">
                            {row.kind === "assistant" && <Mark />}
                            <strong>
                              {row.kind === "assistant" ? "rpi" : zh ? "你" : "You"}
                            </strong>
                          </div>
                          <div className="message-body">
                            {row.kind === "assistant" ? (
                              <div className="prose">
                                <p>{row.text}</p>
                              </div>
                            ) : (
                              <div className="plain-message">
                                <p>{row.text}</p>
                              </div>
                            )}
                          </div>
                          {row.kind === "assistant" && (
                            <div className="message-actions">
                              <button
                                className="message-copy message-copy-markdown"
                                type="button"
                              >
                                <Copy size={12} />
                                <span>{zh ? "复制 Markdown" : "Copy as Markdown"}</span>
                              </button>
                            </div>
                          )}
                        </article>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <form className="composer-area" onSubmit={(e) => e.preventDefault()}>
              <div className="composer slim-composer">
                <div className="composer-workspace" aria-label={zh ? "项目目录与分支" : "Project directory and Git branch"}>
                  <div className="composer-context-line">
                    <button
                      type="button"
                      className="composer-workspace-path"
                      title={supports.path}
                    >
                      <Folder size={12} />
                      <span>{supports.path}</span>
                    </button>
                    <div className="composer-workspace-meta">
                      <span className="composer-workspace-branch">
                        <GitBranch size={12} />
                        <span>{supports.branch}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <textarea
                  placeholder={zh ? "发送提示词…" : "Send a prompt…"}
                  aria-label="prompt"
                  rows={3}
                />
                <div className="composer-footer">
                  <div className="composer-options">
                    <button
                      type="button"
                      className="composer-attach"
                      aria-label={zh ? "添加附件" : "Attach files"}
                      title={zh ? "添加附件" : "Attach files"}
                    >
                      <Paperclip size={14} />
                    </button>
                    <ModelMenu
                      language={language}
                      value={model}
                      onChange={setModel}
                      onOpenRuntime={() => setPanel("runtime")}
                    />
                    <div className="dropdown-anchor" data-dropdown="true">
                      <button
                        type="button"
                        className="composer-thinking"
                        aria-haspopup="listbox"
                        aria-expanded="false"
                        title={zh ? "选择思考深度" : "Choose thinking level"}
                      >
                        <span>{supports.thinking}</span>
                        <ChevronDown size={11} />
                      </button>
                    </div>
                    {/* The "steer" queue-type selector and the Shift+Enter hint
                        are removed: one has a single usable value today, the
                        other is a tutorial that is always visible. */}
                  </div>
                  <div className="composer-controls">
                    <button
                      type="submit"
                      className="send-button"
                      aria-label={zh ? "发送" : "Send"}
                      title={zh ? "发送" : "Send"}
                    >
                      <ArrowUp size={17} />
                    </button>
                  </div>
                </div>
                {/* The metrics strip duplicates the runtime panel 1:1, so the
                    row is trimmed to two readouts — but each keeps the same
                    icon the original used, so it is still scannable without
                    reading the numbers. */}
                <div className="slim-metrics">
                  <span
                    className="composer-metric"
                    title={`${zh ? "上下文" : "Context"}: ${supports.contextTokens} / ${supports.contextWindow}`}
                    aria-label={`${zh ? "上下文" : "Context"}: ${supports.contextTokens} / ${supports.contextWindow}`}
                  >
                    <Gauge size={12} aria-hidden="true" />
                    <strong>
                      {supports.contextTokens} / {supports.contextWindow}
                    </strong>
                  </span>
                  <span
                    className="composer-metric"
                    title={`${zh ? "缓存命中" : "Cache hit"}: 98%`}
                    aria-label={`${zh ? "缓存命中" : "Cache hit"}: 98%`}
                  >
                    <Database size={12} aria-hidden="true" />
                    <strong>98%</strong>
                  </span>
                  <button
                    type="button"
                    className="slim-metrics-more"
                    onClick={() => setPanel("runtime")}
                  >
                    {zh ? "详情" : "Details"}
                  </button>
                </div>
              </div>
            </form>

            {panel && (
              <aside className="inspector slim-inspector">
                <div className="panel-heading">
                  <h2>
                    {panel === "trace"
                      ? zh
                        ? "执行轨迹"
                        : "Execution trace"
                      : panel === "runtime"
                        ? zh
                          ? "运行时与上下文"
                          : "Runtime and context"
                        : zh
                          ? "项目文件"
                          : "Project files"}
                  </h2>
                  <button
                    className="icon-button"
                    onClick={() => setPanel("")}
                    aria-label={zh ? "关闭面板" : "Close panel"}
                  >
                    <CloseIcon />
                  </button>
                </div>
                {panel === "runtime" && (
                  <>
                    <div className="stat-row">
                      <span>{zh ? "模型" : "Model"}</span>
                      {/* Read-only here: the composer menu owns the choice. */}
                      <strong>{model}</strong>
                    </div>
                    <div className="stat-row">
                      <span>{zh ? "上下文" : "Context"}</span>
                      <strong>
                        {supports.contextPercent}% / {supports.contextWindow}
                      </strong>
                    </div>
                    <div className="stat-row">
                      <span>{zh ? "输入 / 输出" : "Input / output"}</span>
                      <strong>234k / 1.1k</strong>
                    </div>
                    <div className="stat-row">
                      <span>{zh ? "工具调用" : "Tool calls"}</span>
                      <strong>19</strong>
                    </div>
                    <div className="stat-row">
                      <span>{zh ? "缓存命中" : "Cache hit"}</span>
                      <strong>98%</strong>
                    </div>
                    <p className="muted slim-note">
                      {zh
                        ? "模型与思考深度只在输入框下方选择；这个面板只做只读诊断，不再放一份重复的下拉。"
                        : "Model and thinking level are chosen below the input only. This panel is read-only diagnostics instead of a second copy of the same dropdowns."}
                    </p>
                  </>
                )}
                {panel === "trace" && (
                  <p className="muted slim-note">
                    {zh
                      ? "执行轨迹面板（演示占位）：与原版同一个面板，不再与“诊断”面板争夺同一块右侧空间。"
                      : "Execution trace panel (placeholder): same panel as the original, but it no longer competes with a separate diagnostics panel for the same right-hand space."}
                  </p>
                )}
                {panel === "files" && (
                  <p className="muted slim-note">
                    {zh
                      ? "项目文件面板（演示占位）。"
                      : "Project files panel (placeholder)."}
                  </p>
                )}
              </aside>
            )}
          </div>
        </main>
      </section>

      {settingsOpen && (
        <div
          className="workspace-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={zh ? "设置" : "Settings"}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
        >
          <div className="workspace-dialog-surface">
            <div className="dialog-heading">
              <h2>{zh ? "设置" : "Settings"}</h2>
              <button
                className="icon-button"
                aria-label={zh ? "关闭对话框" : "Close dialog"}
                onClick={() => setSettingsOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="project-form workspace-preferences">
              <label>{zh ? "外观" : "Appearance"}</label>
              <div className="project-mode" role="group" aria-label={zh ? "外观" : "Appearance"}>
                <button aria-pressed={false}>{zh ? "随系统" : "System"}</button>
                <button aria-pressed={!dark} onClick={() => onDark(false)}>
                  <Sun size={16} />
                  {zh ? "浅色" : "Light"}
                </button>
                <button aria-pressed={dark} onClick={() => onDark(true)}>
                  <Moon size={16} />
                  {zh ? "深色" : "Dark"}
                </button>
              </div>
              <label>{zh ? "语言" : "Language"}</label>
              <div className="project-mode" role="group" aria-label={zh ? "语言" : "Language"}>
                <button aria-pressed={language === "zh"} onClick={() => onLanguage("zh")}>
                  简体中文
                </button>
                <button aria-pressed={language === "en"} onClick={() => onLanguage("en")}>
                  English
                </button>
              </div>
              <div className="shortcut-list">
                <span>{zh ? "新建会话" : "New session"}</span>
                <kbd>Ctrl / ⌘ N</kbd>
                <span>{zh ? "设置" : "Settings"}</span>
                <kbd>Ctrl / ⌘ ,</kbd>
                <span>{zh ? "收起侧边栏" : "Toggle sidebar"}</span>
                <kbd>Ctrl / ⌘ B</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {recentOpen && (
        <RecentChats
          language={language}
          activeId={activeId}
          onSelect={(id) => {
            const session = sessions.find((x) => x.id === id);
            if (!session) return;
            setActiveId(id);
            setActiveProject(session.projectId);
            setCollapsed((prev) => {
              const next = new Set(prev);
              next.delete(session.projectId);
              return next;
            });
          }}
          onClose={() => setRecentOpen(false)}
        />
      )}

      {projectDialog && (
        <div
          className="workspace-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={zh ? "添加项目" : "Add project"}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProjectDialog(false);
          }}
        >
          <div className="workspace-dialog-surface">
            <div className="dialog-heading">
              <h2>{zh ? "添加项目" : "Add project"}</h2>
              <button
                className="icon-button"
                aria-label={zh ? "关闭对话框" : "Close dialog"}
                onClick={() => setProjectDialog(false)}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="project-form">
              <p className="dialog-description">
                {zh
                  ? "每个项目都有自己的文件、代码变更和会话。"
                  : "Keep files, changes, and conversations together in a project."}
              </p>
              <div className="project-mode" role="group">
                <button aria-pressed={true}>{zh ? "新建项目" : "Create project"}</button>
                <button aria-pressed={false}>{zh ? "打开已有目录" : "Open folder"}</button>
              </div>
              <label htmlFor="slim-project-name">
                {zh ? "项目名称" : "Project name"}
              </label>
              <input id="slim-project-name" placeholder={zh ? "例如：我的网站" : "e.g. my-website"} />
              <div className="project-location">
                <Folder size={14} />
                <span>/workspace/projects/…</span>
              </div>
              <div className="dialog-actions">
                <button type="button" onClick={() => setProjectDialog(false)}>
                  {zh ? "取消" : "Cancel"}
                </button>
                <button className="primary">
                  <Check size={14} />
                  {zh ? "添加项目" : "Add project"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlimSessionRow({
  language,
  session,
  active,
  onSelect,
}: {
  language: Language;
  session: (typeof sessions)[number];
  active: boolean;
  onSelect: () => void;
}) {
  const zh = language === "zh";
  const label = session.title || (zh ? "新会话" : "New session");
  return (
    <div className={`project-session ${active ? "active" : ""}`}>
      <button className="project-session-link" onClick={onSelect} title={label}>
        {session.awaiting ? (
          <span className="session-answer-dot" />
        ) : session.running ? (
          <span className="session-running-dot" />
        ) : session.pinned ? (
          <Pin size={12} />
        ) : (
          <span className="session-indent-dot" />
        )}
        <span className="session-title">{label}</span>
        <time dateTime={new Date(session.updatedAt).toISOString()}>
          {shortTime(session.updatedAt, language)}
        </time>
      </button>
      {/* The per-row overflow menu is unchanged; it is the only place these
          actions exist, so it is not duplication. */}
      <div className="session-menu">
        <button
          className="icon-button session-menu-trigger"
          aria-label={`${zh ? "会话操作" : "Session actions"}: ${label}`}
          aria-haspopup="menu"
          aria-expanded={false}
        >
          <MoreHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}

function shortTime(time: number, language: Language) {
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000));
  const zh = language === "zh";
  if (minutes < 1) return zh ? "刚刚" : "now";
  if (minutes < 60) return zh ? `${minutes} 分钟` : `${minutes}m`;
  if (minutes < 1440)
    return zh ? `${Math.floor(minutes / 60)} 小时` : `${Math.floor(minutes / 60)}h`;
  return new Intl.DateTimeFormat(zh ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
  }).format(time);
}

function TraceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}


function FilesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
      <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
      <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
