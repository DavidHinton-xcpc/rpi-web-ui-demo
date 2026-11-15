import { useState } from "react";
import {
  Activity,
  Archive,
  ArchiveRestore,
  ArrowDown,
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Copy,
  Database,
  Files,
  Folder,
  FolderOpen,
  FolderPlus,
  Gauge,
  GitBranch,
  GitFork,
  History,
  ListOrdered,
  ListTodo,
  Loader2,
  LogOut,
  Maximize2,
  Moon,
  MoreHorizontal,
  PanelLeft,
  PanelRight,
  Paperclip,
  Pin,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  SquarePen,
  Sun,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { type Language, projects, sessions, supports, transcript } from "../data";
import { Mark, ToolRow } from "../shared";
import {
  MessageSearchPopover,
  type NativePanel,
  NativePanelView,
  TimelineRail,
} from "./NativePanels";

/**
 * Faithful reproduction of the current rpi-web preview sidebar + toolbar +
 * composer. Class names, icon choices, ordering and copy are copied from
 * ProjectSidebar.tsx / App.tsx so the real stylesheet styles it unchanged.
 */
export function NativeApp({ language }: { language: Language }) {
  const zh = language === "zh";
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState("s1");
  const [dark, setDark] = useState(false);
  // Verified against the running build: trace, inspector, files and runtime all
  // render into the same single aside slot and are mutually exclusive. Message
  // search and the timeline are independent overlays and can coexist with it.
  const [panel, setPanel] = useState<NativePanel>("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const recent = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  const visibleRecent = recent.slice(0, recentExpanded ? 10 : 5);

  return (
    <div className={`workspace${dark ? " demo-dark" : ""}`} data-native>
      <aside className="sidebar open">
        <div className="sidebar-brand">
          <Mark /> <span>rpi</span>{" "}
          <span className="brand-caption">{zh ? "工作区" : "workspace"}</span>
        </div>

        <div className="project-navigation">
          <div className="sidebar-primary-actions">
            <button className="sidebar-new-chat">
              <SquarePen size={16} />
              <span>{zh ? "新建会话" : "New session"}</span>
              <kbd>Ctrl N</kbd>
            </button>
          </div>

          <section
            className="recent-sessions"
            aria-label={zh ? "最近会话" : "Recent chats"}
          >
            <div className="project-section-heading recent-sessions-heading">
              <span>
                <Clock3Icon />
                {zh ? "最近会话" : "Recent chats"}
              </span>
              {recent.length > 5 && (
                <button
                  className="recent-sessions-toggle"
                  type="button"
                  aria-expanded={recentExpanded}
                  aria-label={
                    recentExpanded
                      ? zh
                        ? "收起最近会话"
                        : "Show fewer recent chats"
                      : zh
                        ? "展开最近会话"
                        : "Show more recent chats"
                  }
                  onClick={() => setRecentExpanded((v) => !v)}
                >
                  {recentExpanded ? (
                    <ChevronDown size={13} />
                  ) : (
                    <ChevronRight size={13} />
                  )}
                  <span>
                    {recentExpanded ? (zh ? "收起" : "Less") : zh ? "更多" : "More"}
                  </span>
                </button>
              )}
            </div>
            <div className="recent-session-list">
              {visibleRecent.map((session) => (
                <SessionRow
                  key={`recent-${session.id}`}
                  {...session}
                  language={language}
                  recent
                  projectName={
                    projects.find((p) => p.id === session.projectId)?.name
                  }
                  active={session.id === activeId}
                  onSelect={() => setActiveId(session.id)}
                />
              ))}
            </div>
          </section>

          <div className="project-section-heading">
            <span>{zh ? "项目" : "Projects"}</span>
            <div>
              <button
                className="icon-button"
                aria-label={zh ? "查看已归档" : "Show archived chats"}
                title={zh ? "查看已归档项目和会话" : "Show archived projects and chats"}
              >
                <Archive size={14} />
              </button>
              <button
                className="icon-button"
                aria-label={zh ? "新建项目" : "New project"}
                title={zh ? "新建项目" : "New project"}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <nav
            className="project-tree"
            aria-label={zh ? "项目与会话" : "Projects and chats"}
          >
            {projects.map((project) => {
              const chats = sessions
                .filter((s) => s.projectId === project.id)
                .sort(
                  (a, b) =>
                    Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
                    b.updatedAt - a.updatedAt,
                );
              const expanded = !collapsed.has(project.id);
              return (
                <section
                  key={project.id}
                  className={`project-group ${project.id === "rpi-web" ? "selected-project" : ""}`}
                  aria-label={project.name}
                >
                  <div className="project-group-header">
                    <button
                      className="icon-button project-collapse"
                      aria-label={`${expanded ? (zh ? "折叠项目" : "Collapse project") : zh ? "展开项目" : "Expand project"}: ${project.name}`}
                      aria-expanded={expanded}
                      onClick={() => setCollapsed((prev) => {
                        const next = new Set(prev);
                        if (next.has(project.id)) next.delete(project.id);
                        else next.add(project.id);
                        return next;
                      })}
                    >
                      {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    <button
                      className="project-name"
                      aria-label={`${zh ? "展开项目" : "Expand project"}: ${project.name}`}
                      title={project.path}
                      aria-expanded={expanded}
                      onClick={() => setCollapsed((prev) => {
                        const next = new Set(prev);
                        if (next.has(project.id)) next.delete(project.id);
                        else next.add(project.id);
                        return next;
                      })}
                    >
                      {project.id === "rpi-web" ? (
                        <FolderOpen size={15} />
                      ) : (
                        <Folder size={15} />
                      )}
                      <span>{project.name}</span>
                    </button>
                    <button
                      className="icon-button project-menu-trigger"
                      aria-label={`${zh ? "项目操作" : "Project actions"}: ${project.name}`}
                      aria-haspopup="menu"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                    <button
                      className="icon-button project-new-session"
                      aria-label={`${zh ? "项目内新建会话" : "New session in"}: ${project.name}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {expanded && (
                    <div className="project-chats">
                      {chats.map((session) => (
                        <SessionRow
                          key={session.id}
                          language={language}
                          active={session.id === activeId}
                          {...session}
                          onSelect={() => setActiveId(session.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </nav>

          <button className="sidebar-add-project">
            <FolderPlus size={15} />
            {zh ? "添加项目" : "Add project"}
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="demo-preview-badge" title="rpi-web preview · 823b02d21434">
            <span aria-hidden="true" className="demo-preview-dot" />
            rpi-web preview
          </div>
          <div className="utility-nav">
            <button onClick={() => setSettingsOpen(true)}>
              <Settings2 size={14} />
              {zh ? "设置" : "Settings"}
              <kbd>Ctrl ,</kbd>
            </button>
            <button
              onClick={() => setPanel(panel === "runtime" ? "" : "runtime")}
              className={panel === "runtime" ? "active" : ""}
            >
              <SlidersHorizontal size={14} /> {zh ? "运行时设置" : "Runtime settings"}
            </button>
          </div>
          <div className="account-panel">
            <span className="user-avatar">U</span>
            <span className="account-name">{zh ? "工作区用户" : "Workspace user"}</span>
            <button
              className="icon-button"
              aria-label={zh ? "切换外观" : "Toggle appearance"}
              title={zh ? "切换到深色模式" : "Switch to dark mode"}
              onClick={() => setDark((v) => !v)}
            >
              <Moon size={14} />
            </button>
            <button
              type="button"
              className="icon-button account-button"
              title={zh ? "退出登录" : "Sign out"}
              aria-label={zh ? "退出登录" : "Sign out"}
            >
              <LogOut size={15} />
            </button>
          </div>
          <div className="local-label">
            <span
              className="workspace-security"
              title={zh ? "受保护的工作区" : "Protected workspace"}
              aria-label={zh ? "受保护的工作区" : "Protected workspace"}
            >
              <ShieldCheck size={14} />
            </span>
            <div className="select-menu language-select" data-menu-select="true">
              <button
                type="button"
                className="select-menu-trigger"
                aria-label={zh ? "语言" : "Language"}
                aria-haspopup="listbox"
                aria-expanded="false"
              >
                <span className="select-menu-value">
                  {zh ? "简体中文" : "English"}
                </span>
                <ChevronDown size={14} className="select-menu-chevron" />
              </button>
            </div>
            <button
              className="icon-button"
              aria-label={zh ? "刷新会话" : "Refresh chats"}
              title={zh ? "刷新会话" : "Refresh chats"}
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </aside>

      <Splitter />

      <section className="main-shell">
        <header className="toolbar">
          <div className="toolbar-left">
            <button className="icon-button" aria-label={zh ? "切换侧边栏" : "Toggle sidebar"}>
              <PanelLeft size={17} />
            </button>
            <div className="breadcrumb" aria-label="rpi-web · session">
              <span className="breadcrumb-project" title="rpi-web">
                rpi-web
              </span>
              <span className="breadcrumb-separator" aria-hidden="true">
                ·
              </span>
              <h1 title={sessions[0].title}>{sessions[0].title}</h1>
            </div>
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="icon-button"
              aria-label={zh ? "沉浸式查看" : "Immersive view"}
              title={zh ? "沉浸式查看" : "Immersive view"}
            >
              <Maximize2 size={17} />
            </button>
            <span className="connection">
              <span className="status-dot" /> {zh ? "已连接" : "connected"}
            </span>
            <button
              type="button"
              className="icon-button toolbar-fork"
              title={zh ? "分叉当前会话" : "Fork current session"}
              aria-label={zh ? "分叉当前会话" : "Fork current session"}
            >
              <GitBranch size={16} />
            </button>
            <button
              className="icon-button toolbar-clone"
              title={zh ? "克隆当前会话" : "Clone current session"}
              aria-label={zh ? "克隆当前会话" : "Clone current session"}
            >
              <Copy size={16} />
            </button>
            <button
              type="button"
              className={`icon-button ${searchOpen ? "selected" : ""}`}
              aria-label={zh ? "搜索消息" : "Search messages"}
              title={zh ? "搜索消息" : "Search messages"}
              aria-pressed={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search size={17} />
            </button>
            <button
              type="button"
              className={`icon-button ${timelineOpen ? "selected" : ""}`}
              aria-label={zh ? "会话时间轴" : "Conversation timeline"}
              aria-pressed={timelineOpen}
              title={zh ? "展开时间轴" : "Expand timeline"}
              onClick={() => setTimelineOpen((v) => !v)}
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
              <Activity size={17} />
            </button>
            <button
              className={`icon-button ${panel === "inspector" ? "selected" : ""}`}
              aria-label={zh ? "切换诊断面板" : "Toggle inspector"}
              title={zh ? "切换诊断面板" : "Toggle inspector"}
              aria-pressed={panel === "inspector"}
              onClick={() => setPanel(panel === "inspector" ? "" : "inspector")}
            >
              <PanelRight size={17} />
            </button>
            <button
              className={`icon-button ${panel === "files" ? "selected" : ""}`}
              aria-label={zh ? "切换项目文件" : "Toggle project files"}
              title={zh ? "切换项目文件" : "Toggle project files"}
              aria-pressed={panel === "files"}
              onClick={() => setPanel(panel === "files" ? "" : "files")}
            >
              <Files size={17} />
            </button>
          </div>
        </header>

        <main className="main-content chat-layout">
          <div className="conversation-column">
            <div className="transcript-frame">
              {searchOpen && <MessageSearchPopover language={language} />}
              {timelineOpen && <TimelineRail language={language} />}
              <div className="transcript" data-hist="true">
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
                        <article className={`message ${row.kind === "user" ? "user" : "assistant"}`}>
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
                              <button className="message-copy message-copy-markdown" type="button">
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
              <div className="composer">
                <div className="composer-workspace" aria-label="Project directory and Git branch">
                  <div className="composer-context-line">
                    <button
                      type="button"
                      className="composer-workspace-path"
                      aria-label={supports.path}
                      title={supports.path}
                    >
                      <Folder size={12} />
                      <span>{supports.path}</span>
                    </button>
                    <div className="composer-workspace-meta">
                      <span
                        className="composer-workspace-branch"
                        title={`Branch: ${supports.branch}`}
                        aria-label={`Branch: ${supports.branch}`}
                      >
                        <GitBranch size={12} />
                        <span>{supports.branch}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <textarea
                  placeholder={
                    zh ? "发送提示词，或输入 / 使用命令…" : "Send a prompt, or type / for commands…"
                  }
                  aria-label="prompt"
                  rows={3}
                />
                <div className="composer-footer">
                  <div className="composer-options">
                    <button type="button" className="composer-attach" aria-label={zh ? "添加附件" : "Attach files"}>
                      <Paperclip size={14} />
                    </button>
                    <div className="composer-runtime-controls">
                      <div className="dropdown-anchor" data-dropdown="true">
                        <button
                          type="button"
                          className="composer-model"
                          aria-haspopup="listbox"
                          aria-expanded="false"
                          aria-label={zh ? "选择模型" : "Choose model"}
                          title={zh ? "选择模型" : "Choose model"}
                        >
                          <span>{supports.model}</span>
                          <ChevronDown size={11} />
                        </button>
                      </div>
                      <div className="dropdown-anchor" data-dropdown="true">
                        <button
                          type="button"
                          className="composer-thinking"
                          aria-haspopup="listbox"
                          aria-expanded="false"
                          aria-label={zh ? "选择思考深度" : "Choose thinking level"}
                          title={zh ? "选择思考深度" : "Choose thinking level"}
                        >
                          <span>{supports.thinking}</span>
                          <ChevronDown size={11} />
                        </button>
                      </div>
                    </div>
                    <span className="composer-shortcut-hint" title={zh ? "换行" : "new line"}>
                      <kbd>Shift</kbd>
                      <span aria-hidden="true">+</span>
                      <kbd>Enter</kbd>
                      <span>{zh ? "换行" : "new line"}</span>
                    </span>
                    <div className="select-menu composer-queue-kind" data-menu-select="true">
                      <button
                        type="button"
                        className="select-menu-trigger"
                        aria-label={zh ? "队列类型" : "Queue type"}
                        aria-haspopup="listbox"
                        aria-expanded="false"
                      >
                        <span className="select-menu-value">steer</span>
                        <ChevronDown size={12} />
                      </button>
                    </div>
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
                <details className="composer-metrics">
                  <summary className="composer-metrics-summary">
                    <span className="composer-metric" title={zh ? "输入 token" : "Input tokens"}>
                      <ArrowDown size={12} />
                      <strong>234k</strong>
                    </span>
                    <span className="composer-metric" title={zh ? "输出 token" : "Output tokens"}>
                      <ArrowUp size={12} />
                      <strong>1.1k</strong>
                    </span>
                    <span className="composer-metric" title={zh ? "缓存命中" : "Cache hit"}>
                      <Database size={12} />
                      <strong>98%</strong>
                    </span>
                    <span className="composer-metric" title={zh ? "上下文" : "Context"}>
                      <Gauge size={12} />
                      <strong>
                        {supports.contextTokens} / {supports.contextWindow}
                      </strong>
                    </span>
                    <span className="composer-metrics-more">{zh ? "详情" : "details"}</span>
                  </summary>
                  <div className="composer-metrics-detail">
                    <span className="composer-metric" title="Cached tokens">
                      <Database size={12} />
                      <strong>233k</strong>
                    </span>
                    <span className="composer-metric" title="Total tokens">
                      <Sigma size={12} />
                      <strong>235k</strong>
                    </span>
                    <span className="composer-metric" title="Tool calls">
                      <Wrench size={12} />
                      <strong>19</strong>
                    </span>
                    <span className="composer-metric" title="Operations">
                      <History size={12} />
                      <strong>8</strong>
                    </span>
                    <span className="composer-metric" title="Cost">
                      <CircleDollarSign size={12} />
                      <strong>$0.0000</strong>
                    </span>
                    <span className="composer-metric" title="Events observed">
                      <Activity size={12} />
                      <strong>0</strong>
                    </span>
                  </div>
                </details>
              </div>
            </form>
          </div>
          {panel && (
            <>
              <div
                className="workspace-splitter"
                role="separator"
                aria-orientation="vertical"
              />
              <NativePanelView
                panel={panel}
                language={language}
                onClose={() => setPanel("")}
              />
            </>
          )}
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
                <X size={17} />
              </button>
            </div>
            <div className="project-form workspace-preferences">
              <label>{zh ? "外观" : "Appearance"}</label>
              <div className="project-mode" role="group">
                <button aria-pressed={false}>随系统</button>
                <button aria-pressed={!dark}>
                  <Sun size={16} />
                  {zh ? "浅色" : "Light"}
                </button>
                <button aria-pressed={dark} onClick={() => setDark(true)}>
                  <Moon size={16} />
                  {zh ? "深色" : "Dark"}
                </button>
              </div>
              <label>{zh ? "语言" : "Language"}</label>
              <div className="select-menu" data-menu-select="true">
                <button type="button" className="select-menu-trigger">
                  <span className="select-menu-value">
                    {zh ? "简体中文" : "English"}
                  </span>
                  <ChevronDown size={14} className="select-menu-chevron" />
                </button>
              </div>
              <label>{zh ? "工具名称" : "Tool names"}</label>
              <div className="project-mode" role="group">
                <button aria-pressed={true}>{zh ? "原生名称" : "Native names"}</button>
                <button aria-pressed={false}>{zh ? "映射名称" : "Mapped names"}</button>
              </div>
              <div className="shortcut-list">
                <span>{zh ? "新建会话" : "New session"}</span>
                <kbd>Ctrl / ⌘ N</kbd>
                <span>{zh ? "搜索会话" : "Search chats"}</span>
                <kbd>Ctrl / ⌘ K</kbd>
                <span>{zh ? "收起侧边栏" : "Close sidebar"}</span>
                <kbd>Ctrl / ⌘ B</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Clock3Icon() {
  // lucide Clock3, inlined to keep the demo icon set explicit.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16.5 12" />
    </svg>
  );
}

function Splitter() {
  return (
    <div className="workspace-splitter" role="separator" aria-orientation="vertical" />
  );
}

function SessionRow({
  language,
  title,
  projectName,
  active,
  recent,
  pinned,
  running,
  awaiting,
  relation,
  tags,
  updatedAt,
  onSelect,
}: {
  language: Language;
  title: string;
  projectName?: string;
  active: boolean;
  recent?: boolean;
  pinned?: boolean;
  running?: boolean;
  awaiting?: boolean;
  relation?: "fork" | "clone";
  tags?: string[];
  updatedAt: number;
  onSelect: () => void;
}) {
  const zh = language === "zh";
  const label = title || (zh ? "新会话" : "New session");
  return (
    <div className={`${recent ? "recent-session" : "project-session"} ${active ? "active" : ""}`}>
      <button
        className="project-session-link"
        onClick={onSelect}
        title={label}
        aria-current={active ? "page" : undefined}
      >
        {awaiting ? (
          <span className="session-answer-dot" />
        ) : running ? (
          <span className="session-running-dot" />
        ) : pinned ? (
          <Pin size={12} />
        ) : (
          <span className="session-indent-dot" />
        )}
        {relation && (
          <span
            className={`session-relation-prefix session-relation-${relation}`}
            aria-hidden="true"
          >
            {relation === "clone" ? <GitBranch size={12} /> : <GitFork size={12} />}
          </span>
        )}
        <span className={`session-title ${recent ? "recent-session-title" : ""}`} data-title={recent ? label : undefined}>
          {!recent && label}
        </span>
        {projectName && (
          <span className="recent-project-tag" title={projectName} aria-label={projectName}>
            {projectName}
          </span>
        )}
        {!recent && (tags ?? []).length > 0 && (
          <span className="session-tags">
            {(tags ?? []).slice(0, 2).map((tag) => (
              <span className="session-tag" key={tag}>
                {tag}
              </span>
            ))}
          </span>
        )}
        <time dateTime={new Date(updatedAt).toISOString()}>
          {shortTime(updatedAt, language)}
        </time>
      </button>
      {!recent && (
        <div className="session-menu">
          <button
            className="icon-button session-menu-trigger"
            aria-label={`${zh ? "会话操作" : "Session actions"}: ${label}`}
            aria-expanded={false}
            aria-haspopup="menu"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function shortTime(time: number, language: Language) {
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60_000));
  const zh = language === "zh";
  if (minutes < 1) return zh ? "刚刚" : "now";
  if (minutes < 60) return zh ? `${minutes} 分钟` : `${minutes}m`;
  if (minutes < 1440) return zh ? `${Math.floor(minutes / 60)} 小时` : `${Math.floor(minutes / 60)}h`;
  return new Intl.DateTimeFormat(zh ? "zh-CN" : "en", {
    month: "short",
    day: "numeric",
  }).format(time);
}

/* Keep unused imports honest: these icons exist in the real toolbar but are
 * rendered by panels this demo does not reproduce. */
void ArchiveRestore;
void Bot;
void Check;
void Code2;
void ListTodo;
void Loader2;
void Play;
void Sparkles;
void Tag;
