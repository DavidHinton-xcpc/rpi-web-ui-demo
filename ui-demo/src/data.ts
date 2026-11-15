export type Language = "zh" | "en";

/**
 * Fixed demo dataset. Deliberately mirrors the shape of a real workspace: four
 * projects, a long session tree, and a recent-chats list whose entries are
 * exactly the same objects that also live inside their project.
 */
export type Project = {
  id: string;
  name: string;
  path: string;
  archived?: boolean;
};

export type Session = {
  id: string;
  projectId: string;
  title: string;
  updatedAt: number;
  pinned?: boolean;
  archived?: boolean;
  running?: boolean;
  awaiting?: boolean;
  tags?: string[];
  relation?: "fork" | "clone";
};

const now = Date.now();
const min = (n: number) => n * 60_000;

// Sample workspace. Paths are illustrative: the real ones would expose a local
// user name and directory layout, which the demo has no reason to publish.
export const projects: Project[] = [
  { id: "rpi-web", name: "rpi-web", path: "/workspace/projects/rpi-web" },
  { id: "pi-rust", name: "pi-rust", path: "/workspace/projects/pi-rust" },
  { id: "task", name: "task", path: "/workspace/projects/task" },
  { id: "screen", name: "screen", path: "/workspace/projects/screen" },
];

export const sessions: Session[] = [
  {
    id: "s1",
    projectId: "rpi-web",
    title: "Extract the whole rpi-web preview UI into a standalone demo.",
    updatedAt: now - min(1),
    tags: ["ui"],
  },
  {
    id: "s2",
    projectId: "rpi-web",
    title: "Work through the open issues, mine first.",
    updatedAt: now - min(22),
    running: true,
  },
  {
    id: "s3",
    projectId: "task",
    title: "Summarise what a business plan has to cover.",
    updatedAt: now - min(35),
  },
  {
    id: "s4",
    projectId: "task",
    title: "Turn this conversation into a single-page HTML file.",
    updatedAt: now - min(74),
  },
  {
    id: "s5",
    projectId: "task",
    title: "Tell me a short joke.",
    updatedAt: now - min(240),
  },
  {
    id: "s6",
    projectId: "pi-rust",
    title: "Adjust the pi-rust-pr skill.",
    updatedAt: now - min(62),
  },
  { id: "s7", projectId: "pi-rust", title: "hi", updatedAt: now - min(3000) },
  { id: "s8", projectId: "pi-rust", title: "New session", updatedAt: now - min(4200) },
  {
    id: "s9",
    projectId: "pi-rust",
    title: "Debug the webserver host validation logic.",
    updatedAt: now - min(4400),
    relation: "fork",
  },
  { id: "s10", projectId: "pi-rust", title: "New session", updatedAt: now - min(5000) },
  { id: "s11", projectId: "screen", title: "hi", updatedAt: now - min(3100) },
  {
    id: "s12",
    projectId: "screen",
    title: "The file picker opened during upload does not match the current display scaling.",
    updatedAt: now - min(3400),
    awaiting: true,
  },
  {
    id: "s13",
    projectId: "screen",
    title: "Can I remap the terminal copy and paste shortcuts?",
    updatedAt: now - min(4600),
  },
  { id: "s14", projectId: "rpi-web", title: "New session", updatedAt: now - min(120), pinned: true },
  {
    id: "s15",
    projectId: "pi-rust",
    title: "Old experiment with the connection pool",
    updatedAt: now - min(9000),
    archived: true,
  },
  {
    id: "s16",
    projectId: "task",
    title: "Archived draft of the weekly summary",
    updatedAt: now - min(11000),
    archived: true,
  },
];

export type TranscriptRow =
  | { kind: "user"; id: string; text: string }
  | { kind: "assistant"; id: string; text: string }
  | {
      kind: "tool";
      id: string;
      tool: string;
      target?: string;
      status: "done" | "running";
      elapsed?: string;
    };

export const transcript: TranscriptRow[] = [
  {
    kind: "user",
    id: "r1",
    text: "Extract the whole rpi-web preview UI into a standalone demo.",
  },
  {
    kind: "tool",
    id: "r2",
    tool: "bash",
    target: "find frontend/src -name '*.tsx' | head -40",
    status: "done",
    elapsed: "0.2 s",
  },
  {
    kind: "tool",
    id: "r3",
    tool: "read",
    target: "frontend/src/ProjectSidebar.tsx",
    status: "done",
  },
  {
    kind: "assistant",
    id: "r4",
    text:
      "The sidebar runs top to bottom as: brand, new session, recent chats, " +
      "the project tree, add project, then a fixed footer holding settings, " +
      "runtime settings, an avatar block, a language dropdown and a refresh button.",
  },
  {
    kind: "tool",
    id: "r5",
    tool: "bash",
    target: "grep -n 'sidebar-bottom' frontend/src/*.tsx",
    status: "done",
    elapsed: "0.1 s",
  },
  {
    kind: "tool",
    id: "r6",
    tool: "edit",
    target: "frontend/src/ProjectSidebar.tsx",
    status: "running",
  },
  {
    kind: "assistant",
    id: "r7",
    text:
      "There is real duplication here: the footer \"+\" is exactly the same as " +
      "\"Add project\", the theme toggle exists in three places, and the recent " +
      "chats \"More\" control only takes the list from 5 rows to 10 without the " +
      "container ever growing.",
  },
];

export const supports = {
  model: "example-model-large",
  thinking: "max",
  branch: "master",
  path: "/workspace/projects/rpi-web",
  contextTokens: "68k",
  contextWindow: "1.0M",
  contextPercent: 6.8,
};
