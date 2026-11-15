import { useEffect, useState } from "react";
import { Check, Columns2, PanelLeft, Rows3, Scale } from "lucide-react";
import { type Language } from "./data";
import { NativeApp } from "./native/NativeApp";
import { SlimApp } from "./slim/SlimApp";
import "./shell.css";

type View = "native" | "slim" | "diff";

const COPY = {
  zh: {
    title: "rpi-web UI 对比",
    native: "原生",
    slim: "精简",
    diff: "差异",
    nativeHint: "当前 preview 版本，原样复刻",
    slimHint: "去掉重叠与死控件",
    diffHint: "逐项对比取舍",
  },
  en: {
    title: "rpi-web UI comparison",
    native: "Original",
    slim: "Slim",
    diff: "Diff",
    nativeHint: "The current preview build, reproduced",
    slimHint: "Overlaps and dead controls removed",
    diffHint: "Item-by-item rationale",
  },
} as const;

export function Shell() {
  const [view, setView] = useState<View>("native");
  const [language, setLanguage] = useState<Language>("zh");
  const [dark, setDark] = useState(false);
  const copy = COPY[language];

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [dark, language]);

  return (
    <div className="shell">
      <header className="shell-bar">
        <div className="shell-brand">
          <img src="./favicon.svg" width={22} height={22} alt="" />
          <span>{copy.title}</span>
        </div>
        <div className="shell-switch" role="tablist" aria-label={copy.title}>
          <button
            role="tab"
            aria-selected={view === "native"}
            className={view === "native" ? "selected" : ""}
            onClick={() => setView("native")}
            title={copy.nativeHint}
          >
            <Rows3 size={14} />
            {copy.native}
          </button>
          <button
            role="tab"
            aria-selected={view === "slim"}
            className={view === "slim" ? "selected" : ""}
            onClick={() => setView("slim")}
            title={copy.slimHint}
          >
            <PanelLeft size={14} />
            {copy.slim}
          </button>
          <button
            role="tab"
            aria-selected={view === "diff"}
            className={view === "diff" ? "selected" : ""}
            onClick={() => setView("diff")}
            title={copy.diffHint}
          >
            <Scale size={14} />
            {copy.diff}
          </button>
        </div>
        <div className="shell-right">
          <button
            className="shell-ghost"
            onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
            title="Language"
          >
            {language === "zh" ? "中文" : "EN"}
          </button>
          <button
            className="shell-ghost"
            onClick={() => setDark(!dark)}
            title={dark ? "Light" : "Dark"}
          >
            {dark ? "☾" : "☀"}
          </button>
        </div>
      </header>

      <div className="shell-stage">
        {view === "native" && <NativeApp language={language} />}
        {view === "slim" && (
          <SlimApp
            language={language}
            onLanguage={setLanguage}
            dark={dark}
            onDark={setDark}
          />
        )}
        {view === "diff" && (
          <DiffView language={language} onLanguage={setLanguage} dark={dark} />
        )}
      </div>
    </div>
  );
}

export function App() {
  return <Shell />;
}

type Finding = {
  area: string;
  native: string;
  verdict: "remove" | "merge" | "keep" | "relocate";
  slim: string;
  evidence: string;
};

const FINDINGS: Record<Language, Finding[]> = {
  zh: [
    {
      area: "「添加项目」× 2",
      native: "Projects 标题栏的 + 与侧栏底部的「添加项目」",
      verdict: "merge",
      slim: "只保留标题栏 +，位于项目分区内",
      evidence:
        "两者 onNewProject 完全一致，都调用 setProjectDialog(true)，打开同一个「添加项目」弹窗；而项目行上的 + 走的是另一条路径（POST /sessions），所以「底部添加项目」才是真正的重复项。",
    },
    {
      area: "项目行 + × 4",
      native: "每个项目行 hover 出现 +，顶部「新建会话」全局出现一次",
      verdict: "keep",
      slim: "保留，用途不同：项目行 + 是「在该项目内新建」，顶部是「在当前项目新建」",
      evidence:
        "实测：项目行 + 触发 POST /sessions 且带该 project 上下文；两者不同，不算重复。但 5 个 + 图标同时表达两种含义，靠 aria-label 区分，应加 tooltip。",
    },
    {
      area: "语言切换",
      native: "侧栏底栏下拉 + 设置弹窗内下拉 + 登录页",
      verdict: "relocate",
      slim: "只在设置内",
      evidence:
        "两处读写同一个 language state。侧栏常驻一个语言下拉是低频偏好占据高频空间。",
    },
    {
      area: "外观切换",
      native: "设置弹窗三选 + 底栏月亮按钮 + 登录页",
      verdict: "relocate",
      slim: "只在设置内（三选）",
      evidence:
        "setThemePreference 被调用三次；底栏按钮只能 light↔dark 二态切换，与设置的 system 三态不一致，会造成「设置里选了随系统，点一下就变固定」。",
    },
    {
      area: "「更多」展开最近会话",
      native: "最近会话标题右侧 More / Less",
      verdict: "remove",
      slim: "移除，列表固定 5 条并滚动",
      evidence:
        "实测 .recent-session-list 高度恒为 159px（--recent-list-height），点 More 只是把行数 5→10，scrollHeight 161→321，容器高度不变，内部滚动。既然已经能滚动，展开按钮没有增加可见内容。",
    },
    {
      area: "最近会话整块",
      native: "顶部常驻 5 条最近会话 + 项目树内同名会话",
      verdict: "relocate",
      slim: "改成小浮窗（同搜索会话样式），按需打开",
      evidence:
        "实测 5/5 条最近会话与项目树内条目完全重复（同一 sessionId、同一标题）。但它提供的「跨项目按时间排序」是项目树表达不了的，所以不删内容，只改成浮窗：常驻时它白占 159px 并重复项目树，浮窗打开时这份重复才付费。",
    },
    {
      area: "「工作区用户」头像块",
      native: "U 头像 + Workspace user + 主题按钮 + 登出",
      verdict: "remove",
      slim: "移除。未启用密码时整块无意义；归档移到项目标题栏",
      evidence:
        "account-name 永远是 i18n 里的固定字符串「工作区用户」，不是真实账号。整块只在 authRequired 时提供登出，其余时间是装饰。登出应放进设置。",
    },
    {
      area: "刷新会话图标",
      native: "底栏右下角 RefreshCw",
      verdict: "remove",
      slim: "移除",
      evidence:
        "实测点击只发一次 GET /sessions；而不点击时每 5 秒也在自动轮询同一接口（实测 6 秒内 2 次）。等同浏览器刷新但更弱（不会重连 websocket），也没有反馈。",
    },
    {
      area: "预览徽标",
      native: "「rpi-web preview」带绿点一行",
      verdict: "relocate",
      slim: "移除，改为 header 内信息",
      evidence:
        "仅 VITE_PREVIEW_BUILD=1 时存在，是构建信息而非用户功能，占用了侧栏底栏一整个行高。",
    },
    {
      area: "设置 vs 运行时设置",
      native: "底栏两个并列入口",
      verdict: "merge",
      slim: "设置保留在侧栏，运行时并入右侧面板",
      evidence:
        "设置是工作区级偏好（语言/外观/工具名），运行时是会话级状态（模型/思考深度/上下文）。层级不同，不该并排成两个同级按钮。",
    },
    {
      area: "运行时面板 vs 输入框",
      native: "右侧面板的 Model / Thinking 下拉，与输入框下方两个下拉完全重复",
      verdict: "merge",
      slim: "面板只读诊断，选择只在模型菜单；入口也在该菜单顶部",
      evidence:
        "两边都调用 set_model / set_thinking_level，是同一份状态的两个控件。输入框下方的更靠近发送动作，应保留；右侧改成只读。",
    },
    {
      area: "输入框指标条 vs 诊断面板",
      native: "composer-metrics 十项 + inspector 十四行 stat-row",
      verdict: "merge",
      slim: "只留上下文与命中率两项，且保留原图标（Gauge / Database）",
      evidence:
        "实测同一会话：10 项里 8 项完全同值（input/output/cache hit/cached/total/tool calls/cost/events）；Context 同值不同格式（152k / 1.0M vs 15.2% / 1.0M）；Operations 两处不一致（0 vs 559）——同一份数据两处显示，其中一处还是错的。",
    },
    {
      area: "右侧八个工具栏按钮",
      native: "沉浸 / 分叉 / 克隆 / 搜消息 / 时间轴 / 轨迹 / 诊断 / 文件",
      verdict: "merge",
      slim: "七个按钮：四个面板画成互斥单选，运行时入口并入模型菜单顶部",
      evidence:
        "实测轨迹、诊断、文件、运行时四个面板互斥——渲染进同一个 aside，打开一个会关掉另一个——却画成四个可叠加的开关，这是唯一的实质问题。沉浸式、消息搜索、分叉、克隆、时间轴全部保留；「诊断」的只读统计并入运行时面板（两者本就读写同一份数据），而运行时的入口搬到模型选择菜单顶部——模型选择和上下文/工具状态是同一件事，分开两个入口等于让用户在两处找同一份设置。",
    },
    {
      area: "Ctrl+K 是假的",
      native: "设置弹窗里写着「搜索会话 Ctrl / ⌘ K」",
      verdict: "keep",
      slim: "让 Ctrl K 真的打开最近会话浮窗",
      evidence:
        "实测按下 Ctrl+K 无任何反应：keydown 处理器只处理 N / B / ,，不存在 k 分支，侧栏也没有任何搜索框（.sidebar input 数量为 0）。文档承诺了快捷键却没接线——补上比删掉提示更好。",
    },
    {
      area: "「steer」队列类型下拉",
      native: "输入框底部常驻一个只有单值的下拉",
      verdict: "keep",
      slim: "保留但收进排队时才出现",
      evidence:
        "功能本身有效（steer 打断 vs queue 排队），但只有存在待发队列时才有意义，常驻是空占位。",
    },
    {
      area: "Shift+Enter 提示",
      native: "输入框底部常驻 kbd 提示",
      verdict: "remove",
      slim: "移除",
      evidence:
        "一次性教学信息，占常驻空间。同类提示应进入 placeholder 或首次使用提示。",
    },
    {
      area: "项目行图标滞留 + 隐形按钮可点",
      native: "展开/折叠项目后「+」留在原地不消失；即使 opacity 为 0 也能点",
      verdict: "remove",
      slim: "隐藏时 pointer-events: none；键盘显现改用 :focus-visible",
      evidence:
        "实测：点折叠箭头后 headerHover=false 但 headerFocusWithin=true，于是 :focus-within 把 opacity 顶成 1，指针早已移开图标却留着。同一按钮在 opacity:0 时 pointerEvents=auto，elementFromPoint 命中它——实测点击「看不见的 +」确实发出 POST /sessions 建出新会话。会话行的「…」同样用 :focus-within，问题一致。",
    },
    {
      area: "右侧面板并非「可叠加」",
      native: "四个按钮看起来像四个可并存的开关",
      verdict: "merge",
      slim: "一个面板槽位 + 三个互斥入口",
      evidence:
        "实测：打开「执行轨迹」后再点「项目文件」，轨迹自动关闭；点「诊断」同样替换。四个按钮实际是同一个槽位的四个互斥取值——按开关来画，用户会以为可以叠加。",
    },
  ],
  en: [
    {
      area: "\"Add project\" × 2",
      native: "The + in the Projects heading and the sidebar-footer \"Add project\"",
      verdict: "merge",
      slim: "Keep the heading + only, inside the section it belongs to",
      evidence:
        "Both call onNewProject → setProjectDialog(true): same dialog, same handler. The per-row + takes a different path (POST /sessions), which is why the footer one is the true duplicate.",
    },
    {
      area: "Project row + × 4",
      native: "A hover + per project row, plus one global \"New session\"",
      verdict: "keep",
      slim: "Kept — different jobs: the row + means \"new session in this project\"",
      evidence:
        "Verified: the row + issues POST /sessions scoped to that project. Not a duplicate, but five + icons expressing two meanings need tooltips.",
    },
    {
      area: "Language switch",
      native: "Sidebar footer dropdown + Settings dropdown + login screen",
      verdict: "relocate",
      slim: "Settings only",
      evidence:
        "All three write the same language state. A permanent footer control for a low-frequency preference.",
    },
    {
      area: "Appearance switch",
      native: "Three-way in Settings + a footer moon button + login screen",
      verdict: "relocate",
      slim: "Settings only (three-way)",
      evidence:
        "setThemePreference is called from three places. The footer button only toggles light↔dark, so \"follow system\" cannot be represented — clicking it silently pins a value.",
    },
    {
      area: "\"More\" in Recent chats",
      native: "More / Less toggle in the Recent chats heading",
      verdict: "remove",
      slim: "Removed; list stays at 5 rows and scrolls",
      evidence:
        "Measured: .recent-session-list is a fixed 159px. Clicking More takes rows 5→10 and scrollHeight 161→321 — the box never grows, it scrolls. The toggle reveals nothing.",
    },
    {
      area: "Recent chats as a block",
      native: "A permanent 5-row recent list plus the same sessions in the tree",
      verdict: "relocate",
      slim: "Becomes a small floating window (same chrome as message search)",
      evidence:
        "Measured: 5/5 recent entries duplicate tree entries by sessionId and title. But cross-project recency ordering is something the tree cannot express, so the content stays and only the presentation changes: permanent costs 159px for duplication, a window pays that only while open.",
    },
    {
      area: "\"Workspace user\" block",
      native: "U avatar + \"Workspace user\" + theme button + sign out",
      verdict: "remove",
      slim: "Removed; sign-out moves to Settings, archive to the project heading",
      evidence:
        "account-name is a fixed i18n string, not a real account. The block only does something (logout) when a password is configured.",
    },
    {
      area: "Refresh chats icon",
      native: "RefreshCw at the bottom-right of the sidebar",
      verdict: "remove",
      slim: "Removed",
      evidence:
        "Measured: clicking issues one GET /sessions; the app already polls the same endpoint every 5s (2 calls in a 6s idle window). It is a weaker browser refresh with no feedback.",
    },
    {
      area: "Preview badge",
      native: "\"rpi-web preview\" with a green dot",
      verdict: "relocate",
      slim: "Removed from the sidebar; shown in the demo header",
      evidence:
        "Build metadata gated behind VITE_PREVIEW_BUILD, not a user feature, occupying a full sidebar row.",
    },
    {
      area: "Settings vs Runtime settings",
      native: "Two peer entries in the sidebar footer",
      verdict: "merge",
      slim: "Settings stays in the sidebar; runtime becomes a right-hand panel",
      evidence:
        "One is workspace-scoped (language, theme, tool names), the other session-scoped (model, thinking, context). Different scope should not read as sibling buttons.",
    },
    {
      area: "Runtime panel vs composer",
      native: "Model / Thinking dropdowns exist in the panel and under the composer",
      verdict: "merge",
      slim: "Panel read-only; the menu owns both the choice and the runtime entry",
      evidence:
        "Both drive set_model / set_thinking_level — one state, two controls. The one next to the send action should own the choice.",
    },
    {
      area: "Composer metrics vs inspector",
      native: "Ten composer metrics + fourteen inspector rows",
      verdict: "merge",
      slim: "Two readouts remain (context, cache hit), each keeping its original icon",
      evidence:
        "Measured on one session: 8 of 10 values are identical. Context shows the same number in two formats (152k / 1.0M vs 15.2% / 1.0M) and Operations disagrees (0 vs 559) — one dataset rendered twice, and one of the two is wrong.",
    },
    {
      area: "Eight toolbar buttons",
      native: "Immersive / fork / clone / search / timeline / trace / inspector / files",
      verdict: "merge",
      slim: "Seven buttons: panels are exclusive, runtime moves into the model menu",
      evidence:
        "Measured: trace, inspector, files and runtime are mutually exclusive — same aside, opening one closes the others — yet they are drawn as four stackable toggles. That is the only real problem. Immersive, search, fork, clone and timeline all stay. Inspector's read-only stats fold into the runtime panel (both read the same state), and the runtime entry moves to the top of the composer's model menu — choosing a model and reading its context/tool state is one concern, so two separate entry points made users hunt in both places.",
    },
    {
      area: "Ctrl+K is not wired",
      native: "Settings claims \"Search chats Ctrl / ⌘ K\"",
      verdict: "keep",
      slim: "Ctrl K actually opens the recent-chats window",
      evidence:
        "Measured: Ctrl+K does nothing. The keydown handler only knows N / B / , — no k branch, and the sidebar has zero inputs. The shortcut was documented but never bound; binding it is better than deleting the promise.",
    },
    {
      area: "\"steer\" queue-type dropdown",
      native: "An always-visible dropdown with a single value",
      verdict: "keep",
      slim: "Kept, but only rendered when a queue exists",
      evidence:
        "The steer/queue distinction is real, but it means nothing until something is queued, so a permanent row is a placeholder.",
    },
    {
      area: "Shift+Enter hint",
      native: "Permanent kbd hint under the composer",
      verdict: "remove",
      slim: "Removed",
      evidence:
        "One-time teaching text occupying permanent space; belongs in the placeholder or a first-use hint.",
    },
    {
      area: "The right-hand panels are not additive",
      native: "Four buttons that look like four independent toggles",
      verdict: "merge",
      slim: "One panel slot with three exclusive entries",
      evidence:
        "Measured: opening Execution trace then Project files closes the trace; Inspector replaces both. The four buttons are four exclusive values of one slot, but they are drawn as toggles — which is why they read as stackable when they are not.",
    },
    {
      area: "Lingering row icon + invisible button is clickable",
      native: "After collapsing/expanding a project the \"+\" stays put; at opacity 0 it can still be clicked",
      verdict: "remove",
      slim: "pointer-events: none while hidden; keyboard reveal via :focus-visible",
      evidence:
        "Measured: after clicking the collapse chevron, headerHover=false but headerFocusWithin=true, so :focus-within pins opacity to 1 with the pointer nowhere near the icon. The same button keeps pointerEvents=auto at opacity 0 and elementFromPoint hits it — clicking the invisible \"+\" really does issue POST /sessions and create a chat. The session row's \"…\" uses :focus-within too, so it behaves the same way.",
    },
  ],
};

const VERDICT_LABEL = {
  zh: { remove: "移除", merge: "合并", keep: "保留", relocate: "搬家" },
  en: { remove: "Remove", merge: "Merge", keep: "Keep", relocate: "Move" },
} as const;

function DiffView({
  language,
  onLanguage,
  dark,
}: {
  language: Language;
  onLanguage: (value: Language) => void;
  dark: boolean;
}) {
  const findings = FINDINGS[language];
  const zh = language === "zh";
  const counts = findings.reduce(
    (acc, f) => ({ ...acc, [f.verdict]: (acc[f.verdict] ?? 0) + 1 }),
    {} as Record<Finding["verdict"], number>,
  );
  return (
    <div className={`diff-view${dark ? " demo-dark" : ""}`}>
      <div className="diff-inner">
        <h1>{zh ? "逐项对比：原生 vs 精简" : "Item-by-item: original vs slim"}</h1>
        <p className="diff-lede">
          {zh
            ? `每条都基于对运行中的 preview 版本实测（Playwright 读 DOM、数网络请求、量元素高度），不是凭截图推断。共 ${findings.length} 项：移除 ${counts.remove ?? 0}、合并 ${counts.merge ?? 0}、搬家 ${counts.relocate ?? 0}、保留 ${counts.keep ?? 0}。`
            : `Every row comes from measuring the running preview build (Playwright DOM reads, request counts, element heights), not from reading screenshots. ${findings.length} findings: ${counts.remove ?? 0} removals, ${counts.merge ?? 0} merges, ${counts.relocate ?? 0} relocations, ${counts.keep ?? 0} keeps.`}
        </p>
        <div className="diff-stats">
          {(["remove", "merge", "relocate", "keep"] as const).map((key) => (
            <span key={key} className={`diff-stat diff-stat-${key}`}>
              <strong>{counts[key] ?? 0}</strong>
              {VERDICT_LABEL[language][key]}
            </span>
          ))}
        </div>

        <div className="diff-table" role="table">
          <div className="diff-row diff-head" role="row">
            <span role="columnheader">{zh ? "区域" : "Area"}</span>
            <span role="columnheader">{zh ? "原生" : "Original"}</span>
            <span role="columnheader">{zh ? "结论" : "Verdict"}</span>
            <span role="columnheader">{zh ? "精简后" : "Slim"}</span>
            <span role="columnheader">{zh ? "依据" : "Evidence"}</span>
          </div>
          {findings.map((f) => (
            <div className="diff-row" role="row" key={f.area}>
              <span role="cell" className="diff-area">
                {f.area}
              </span>
              <span role="cell" className="diff-cell">
                {f.native}
              </span>
              <span role="cell">
                <span className={`diff-badge diff-badge-${f.verdict}`}>
                  {f.verdict === "keep" && <Check size={11} />}
                  {VERDICT_LABEL[language][f.verdict]}
                </span>
              </span>
              <span role="cell" className="diff-cell">
                {f.slim}
              </span>
              <span role="cell" className="diff-evidence">
                {f.evidence}
              </span>
            </div>
          ))}
        </div>

        <div className="diff-footer">
          <div className="diff-note">
            <h2>{zh ? "刻意没有改的部分" : "Deliberately unchanged"}</h2>
            <ul>
              <li>
                {zh
                  ? "消息与工具行的排版：ToolDisclosure 已经是单行 + 单箭头，没有冗余开关。"
                  : "Message and tool-row layout: ToolDisclosure is already one line with a single chevron."}
              </li>
              <li>
                {zh
                  ? "分叉与克隆按钮：分叉另有右键菜单和消息 history 两个入口，但工具栏上的分叉是「当前会话」最顺手的一个；克隆则只有这一个入口。两者都保留。"
                  : "The fork and clone buttons: fork has two other entry points (context menu, per-message history), but the toolbar one is the handiest for the current session; clone has no other entry point at all. Both stay."}
              </li>
              <li>
                {zh
                  ? "输入框旁的模型/思考深度下拉：靠近发送动作，是最该保留的那一份。"
                  : "The model/thinking dropdowns next to the composer: closest to the send action, so they are the copy to keep."}
              </li>
            </ul>
          </div>
          <div className="diff-note">
            <h2>{zh ? "判断标准" : "Criteria"}</h2>
            <ul>
              <li>
                {zh
                  ? "同一 state 有两个写入点 → 合并；写入点不在使用现场 → 搬家到设置。"
                  : "Two writers for one state → merge; a writer away from where the state is used → move into Settings."}
              </li>
              <li>
                {zh
                  ? "某个控件在默认窗口下不产生任何可见变化 → 移除。"
                  : "A control that produces no visible change at the default size → remove."}
              </li>
              <li>
                {zh
                  ? "内容有用但常驻代价高 → 搬家成浮窗，而不是删掉（最近会话就是这一类）。"
                  : "Useful content with a permanent-space cost → move into a popover instead of deleting it (this is what happened to Recent chats)."}
              </li>
              <li>
                {zh
                  ? "自动化已经覆盖的动作（轮询、滚动）不再给手动按钮。"
                  : "Actions automation already covers (polling, scrolling) get no manual button."}
              </li>
            </ul>
          </div>
        </div>

        <div className="diff-controls">
          <button onClick={() => onLanguage(language === "zh" ? "en" : "zh")}>
            {language === "zh" ? "Switch to English" : "切换为中文"}
          </button>
          <span className="diff-hint">
            {zh
              ? "右上角可在「原生 / 精简 / 差异」之间切换；原生页与精简页共用同一份数据与样式表。"
              : "Use the header to switch between Original / Slim / Diff. Both views share one dataset and one stylesheet."}
          </span>
        </div>
      </div>
    </div>
  );
}

void Columns2;
