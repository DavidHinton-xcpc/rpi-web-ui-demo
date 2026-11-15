import { type Language, supports } from "../data";

/**
 * The four right-hand surfaces the current build ships. They matter for the
 * comparison because they compete for the same slot and, in two cases, render
 * the same data.
 */
export type NativePanel = "" | "runtime" | "inspector" | "trace" | "files";

export function NativePanelView({
  panel,
  language,
  onClose,
}: {
  panel: NativePanel;
  language: Language;
  onClose: () => void;
}) {
  const zh = language === "zh";
  if (!panel) return null;

  if (panel === "files") {
    return (
      <aside className="workbench">
        <div className="workbench-toolbar">
          <div className="workbench-tabs" role="tablist" aria-label={zh ? "项目视图" : "Project views"}>
            <button className="source-tab" aria-selected="true">
              {zh ? "文件" : "Files"}
            </button>
            <button className="source-tab">
              {zh ? "变更" : "Changes"}
            </button>
          </div>
          <button className="icon-button" onClick={onClose} aria-label={zh ? "关闭项目面板" : "Close project panel"}>
            <CloseIcon />
          </button>
        </div>
        <div className="workbench-browser">
          <div className="workbench-project">{zh ? "项目文件与变更" : "Project files and changes"}</div>
          <ul className="slim-file-list">
            <li>
              <FolderIcon /> frontend
            </li>
            <li>
              <FolderIcon /> &nbsp;&nbsp;src
            </li>
            <li className="active">
              <FileIcon /> &nbsp;&nbsp;&nbsp;&nbsp;App.tsx
            </li>
            <li>
              <FileIcon /> &nbsp;&nbsp;&nbsp;&nbsp;ProjectSidebar.tsx
            </li>
            <li>
              <FileIcon /> &nbsp;&nbsp;&nbsp;&nbsp;Workbench.tsx
            </li>
            <li>
              <FolderIcon /> src
            </li>
            <li>
              <FileIcon /> &nbsp;&nbsp;&nbsp;&nbsp;server.rs
            </li>
          </ul>
        </div>
      </aside>
    );
  }

  if (panel === "runtime") {
    return (
      <aside className="inspector">
        <div className="panel-heading">
          <h2>{zh ? "运行时设置" : "Runtime settings"}</h2>
          <button className="icon-button" onClick={onClose} aria-label={zh ? "关闭面板" : "Close panel"}>
            <CloseIcon />
          </button>
        </div>
        <label className="settings-toggle">
          <input type="checkbox" defaultChecked /> <span>{zh ? "朗读新回复" : "Read new replies aloud"}</span>
        </label>
        <button type="button" className="provider-manager-entry">
          <ShieldIcon /> {zh ? "管理供应商" : "Manage providers"}
        </button>
        <label htmlFor="rt-model">{zh ? "模型" : "Model"}</label>
        <div className="select-menu" data-menu-select="true">
          <button type="button" className="select-menu-trigger" id="rt-model">
            <span className="select-menu-value">{supports.model}</span>
            <ChevronDownIcon />
          </button>
        </div>
        <p className="muted">{zh ? "上下文 1000k" : "Context 1000k"}</p>
        <label htmlFor="rt-thinking">{zh ? "思考深度" : "Thinking level"}</label>
        <div className="select-menu" data-menu-select="true">
          <button type="button" className="select-menu-trigger" id="rt-thinking">
            <span className="select-menu-value">{supports.thinking}</span>
            <ChevronDownIcon />
          </button>
        </div>
        <h3 className="panel-heading">{zh ? "上下文" : "Context"}</h3>
        <div className="context-bar" title={`${supports.contextTokens} / ${supports.contextWindow}`}>
          <span className="context-fill" style={{ width: `${supports.contextPercent}%` }} />
        </div>
        <p className="muted">
          {supports.contextTokens} / {supports.contextWindow} · {supports.contextPercent}%
        </p>
        <p className="muted">{zh ? "compacts past 984k · keeps 20k" : "compacts past 984k · keeps 20k"}</p>
        <h3 className="panel-heading">{zh ? "可用工具" : "Active tools"}</h3>
        <div className="capability-list">
          {["read", "bash", "edit", "write", "docs", "durable"].map((tool) => (
            <span className="badge" key={tool}>
              {tool}
            </span>
          ))}
        </div>
      </aside>
    );
  }

  if (panel === "inspector") {
    const rows: Array<[string, string]> = [
      [zh ? "协议" : "Protocol", "rpi"],
      [zh ? "任务完成事件" : "Settlement", "agent_settled"],
      [zh ? "会话" : "Session", "44a752ff"],
      [zh ? "叶子节点" : "Leaf", "01a1de3f"],
      [zh ? "已观察事件" : "Events observed", "0"],
      [zh ? "上下文" : "Context", `${supports.contextPercent}% / ${supports.contextWindow}`],
      [zh ? "工具调用" : "Tool calls", "19"],
      [zh ? "操作数" : "Operations", "1143"],
      [zh ? "Token" : "Tokens", "234k"],
      [zh ? "输入 token" : "Input tokens", "234k"],
      [zh ? "输出 token" : "Output tokens", "28"],
      [zh ? "缓存 token" : "Cached tokens", "234k"],
      [zh ? "费用" : "Cost", "$0.0000"],
      [zh ? "缓存命中" : "Cache hit", "100%"],
      [zh ? "可用工具" : "Active tools", "6"],
    ];
    return (
      <aside className="inspector">
        <div className="panel-heading">
          <h2>{zh ? "会话诊断" : "Host inspector"}</h2>
          <button className="icon-button" onClick={onClose} aria-label={zh ? "关闭面板" : "Close panel"}>
            <CloseIcon />
          </button>
        </div>
        {rows.map(([label, value]) => (
          <div className="stat-row" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside className="inspector">
      <div className="panel-heading">
        <h2>{zh ? "执行轨迹" : "Execution trace"}</h2>
        <button className="icon-button" onClick={onClose} aria-label={zh ? "关闭面板" : "Close panel"}>
          <CloseIcon />
        </button>
      </div>
      <ol className="slim-trace-list">
        <li>
          <strong>LLM response</strong>
          <small>example-provider:example-model</small>
        </li>
        <li>
          <strong>Tool · read</strong>
          <small>ProjectSidebar.tsx</small>
        </li>
        <li>
          <strong>Tool · bash</strong>
          <small>41.66 s</small>
        </li>
        <li>
          <strong>Tool · bash</strong>
          <small>31.83 s</small>
        </li>
        <li>
          <strong>Tool · edit</strong>
          <small>{zh ? "运行中" : "running"}</small>
        </li>
      </ol>
    </aside>
  );
}

export function MessageSearchPopover({ language }: { language: Language }) {
  const zh = language === "zh";
  return (
    <div className="message-search" role="dialog" aria-label={zh ? "搜索消息" : "Search messages"}>
      <div className="message-search-header">
        <div className="message-search-input">
          <SearchIcon />
          <input
            placeholder={zh ? "搜索当前会话…" : "Search this conversation…"}
            aria-label={zh ? "搜索消息" : "Search messages"}
            defaultValue="sidebar"
          />
        </div>
      </div>
      <p className="message-search-count">
        {zh ? "2 条消息结果" : "2 message results"}
      </p>
      <div className="message-search-results">
        <button className="message-search-result selected" type="button">
          <span className="message-search-result-index">1</span>
          <span>
            {zh
              ? "先梳理一下当前侧边栏的结构。左侧从上到下依次是：品牌、新建会话、最近会话…"
              : "First, the sidebar structure: brand, new session, recent chats…"}
          </span>
        </button>
        <button className="message-search-result" type="button">
          <span className="message-search-result-index">2</span>
          <span>
            {zh ? "这里重复的地方不少：底栏的加号与“添加项目”完全等价…" : "There is real duplication: the footer + equals Add project…"}
          </span>
        </button>
      </div>
    </div>
  );
}

export function TimelineRail({ language }: { language: Language }) {
  const zh = language === "zh";
  // Structure matches ConversationTimeline.tsx: nav > .timeline-panel > ol > li
  // > button.timeline-node > span.timeline-mark, so the stock CSS sizes and
  // colors the ticks exactly as in the real app.
  return (
    <nav
      className="conversation-timeline"
      id="conversation-timeline-navigation"
      aria-label={zh ? "会话时间轴" : "Conversation timeline"}
    >
      <div className="timeline-panel">
        <ol>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <li key={i}>
              <button
                type="button"
                className="timeline-node"
                aria-label={`${zh ? "跳转到消息" : "Go to message"} ${i + 1}`}
                aria-current={i === 2 ? "location" : undefined}
              >
                <span className="timeline-mark" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="select-menu-chevron" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
