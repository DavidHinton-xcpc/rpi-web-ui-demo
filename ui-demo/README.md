# rpi-web UI demo — native vs slim

A standalone, buildable replica of the current rpi-web preview UI, plus a
reduced variant, plus an item-by-item comparison. All three live in one page and
switch from the top-right segmented control.

```
cd ui-demo
npm run dev        # http://127.0.0.1:4319
npm run build      # static bundle in dist/ (relative paths, opens from file://)
```

`node_modules` is a symlink to the real rpi-web frontend's, so the demo uses the
exact `react` / `lucide-react` / `vite` versions the app ships with.

## What is faithful, and why it matters

The `native` mode is not a paraphrase. The stylesheets in `src/native/` are
**copied verbatim** from `rpi-web/frontend/src` (styles, desktop, composer
refinement, markdown, workbench, timeline) and are imported in the same order as
`frontend/src/main.tsx`. Component markup reuses the real class names
(`project-navigation`, `recent-session-list`, `composer-metrics`, …), so the
comparison is against the real CSS rather than a hand-tuned lookalike.

Only the icon SVGs, message bodies and panel contents are reproduced by hand
(the real ones come from a live host). Behaviour that matters for the
comparison is reproduced as measured, including the bug where all right-hand
panels share one slot.

## Findings

The `diff` tab carries the table with evidence for each row. Summary:

| verdict  | count | examples |
| -------- | ----- | -------- |
| remove   | 5     | "More" in Recent chats, "Workspace user", the refresh icon, the Shift+Enter hint, the lingering/invisible row actions |
| merge    | 6     | the two "add project" entry points, the duplicated model/thinking dropdowns, the composer metrics strip vs the inspector, the eight toolbar buttons |
| relocate | 4     | language, appearance, the preview badge, the Recent-chats block (→ floating window) |
| keep     | 3     | the per-project `+`, the Ctrl+K shortcut (bind it, don't delete the promise), one panel slot with exclusive entries |

### How each claim was verified

Everything below was measured against a running preview build with Playwright,
not inferred from screenshots:

- **"More" reveals nothing.** `.recent-session-list` is a fixed `159px`
  (`--recent-list-height`). Clicking More takes rows 5→10 and `scrollHeight`
  161→321 while `clientHeight` stays 159 and the project tree stays at the same
  `y` — it scrolls inside a box that never grows. A separate scroll container
  for 5 rows already exists, so the toggle adds no reachable content.
- **The Recent-chats block is a duplicate.** 5/5 entries matched project-tree
  entries by `sessionId` and title. The only difference is cross-project
  ordering, which is exactly what the `project` tag on each row is compensating
  for. The content is worth keeping (the tree cannot express cross-project
  recency); the *permanent* presentation is not, which is why it becomes a
  floating window rather than being deleted.
- **The refresh icon is weaker than a browser refresh.** Clicking it issues one
  `GET /api/v1/sessions`; the app already polls the same endpoint every 5s
  (2 calls observed in a 6s idle window). It does not reconnect the socket.
- **The two "add project" controls are the same control.** Both call
  `onNewProject` → `setProjectDialog(true)`. The per-project `+` is *not*
  redundant: it issues `POST /api/v1/sessions` scoped to that project.
- **Ctrl+K is advertised but unbound.** The Settings dialog lists
  "Search chats — Ctrl / ⌘ K". Pressing it leaves focus on `BODY`, opens no
  panel, and the keydown handler only branches on `n`, `b`, `,`. The sidebar has
  zero `<input>` elements.
- **The right-hand panels are one slot, not four toggles.** Opening Execution
  trace then Project files closes the trace; Inspector replaces both; Runtime
  settings occupies the same `aside`. They are four exclusive values of one
  slot, drawn as if they stack.
- **Composer metrics duplicate the inspector.** On one session, 8 of 10 values
  were identical. Context appeared as `152k / 1.0M` vs `15.2% / 1.0M`, and
  Operations disagreed (`0` vs `559`) — one dataset rendered twice, one copy
  wrong.
- **Theme has three writers.** `setThemePreference` is called from the Settings
  dialog, the footer moon button and the login screen. The footer button only
  does light↔dark, so it silently overrides a "follow system" preference.
- **A hover-revealed icon lingers, and at opacity 0 it is still clickable.**
  `.project-new-session` is hidden with `opacity: 0` plus `:hover` /
  `:focus-within`. Clicking the collapse chevron leaves focus inside
  `.project-group-header`, so `:focus-within` pins the `+` visible with the
  pointer nowhere near it (measured `headerHover=false`,
  `headerFocusWithin=true`, `opacity=1`). Worse, opacity does not remove the
  button from the hit-test tree: `elementFromPoint` over the invisible `+`
  returns the button, and clicking it issues `POST /api/v1/sessions` and creates
  a chat. The session row's `…` uses the same `:focus-within` pattern.
- **"Workspace user" is a constant.** `account-name` renders a fixed i18n
  string, not a real identity. The block only does something when a password is
  configured.

## What the slim variant changes

- One footer entry (Settings). Language and appearance live there only.
- Archive and immersive view are kept. Archive is a filter over the same project
  tree (toggled from the Projects heading) rather than a separate screen, so the
  tree keeps its position while the set changes. No count badge is shown.
- Recent chats becomes a small floating window on the sidebar. It sits beside
  the sidebar rather than over it, so the tree stays usable, and Escape /
  outside click / picking a row all close it.
- **Chat search** is a separate function: it finds *sessions* across projects,
  not messages inside the open conversation. It matches session titles, project
  names and tags, is opened from the toolbar or `Ctrl / ⌘ K` (the shortcut
  Settings advertises but the original never binds), and is keyboard navigable
  (arrows, Enter, Escape). A hit in a collapsed project or the archived set
  switches that view on so the row is visible. The original build's
  message search only looks inside one conversation — a different feature.
- The two duplicate "add project" affordances collapse to one, in the section
  heading. The per-project `+` stays.
- The composer keeps model/thinking and send, drops the shift+enter tutorial and
  the single-value `steer` dropdown, and collapses ten always-on metrics into
  two plus a "details" jump into the runtime panel. That jump stays next to the
  numbers it explains; the model menu is the other way in.
- Seven toolbar entries: immersive view, chat search, fork, clone, timeline,
  trace, files. The four right-hand panels are rendered as exclusive selections
  instead of stackable toggles, and the separate inspector button is gone because
  its read-only statistics now live inside the runtime panel.
- Runtime settings moves to the top of the composer's model menu. Choosing a
  model and reading its context/tool state is one concern, so the panel is
  reached from the same control that picks the model rather than from a separate
  toolbar button. The menu is keyboard-navigable (ArrowDown opens it, arrows walk
  the runtime row and the model rows as one list, Enter chooses).
  The panel itself is the **full** runtime panel, not a summary: read-aloud
  toggle, provider management, model and thinking selects, context meter with
  the compaction note, and the per-tool enable checklist. Only the entry point
  moved; the diagnostics stay.
- No fake account block, no refresh icon, no preview badge.
- Row actions (`+`, `…`) get `pointer-events: none` while hidden, and keyboard
  reveal keys off `:has(:focus-visible)` instead of `:focus-within`, so a click
  no longer pins an icon and an invisible control cannot be hit. Tabbing into a
  row still reveals them.
- The composer status line keeps two readouts **with their original icons**
  (`Gauge` for context, `Database` for cache hit) instead of dropping to bare
  numbers, so it stays scannable without reading the values.

Measured chrome reduction at 1440×900: sidebar buttons 60 → 32, toolbar buttons
8 → 6, session rows in the sidebar 19 → 8 (the recent list now lives in the
window, so it no longer occupies permanent height).

## The rpi mark

`public/rpi-mark.svg` is the logo from the project README
(`docs/images/rpi-logo.jpg`, 600x600 shown at `width="240"`), traced with
potrace into a single vector path. It is painted through `mask-image` with
`background-color: currentColor`, so one file serves both themes and the mark
follows the surrounding text colour.

It sits at 82% of its tile, measured at 3x across 0.62–0.9: full bleed traced
the gear to the very edge, smaller ratios lost the "rpi" lettering. Size itself
comes from the existing stylesheet, which already distinguishes the 25px
sidebar tile from the 21px message avatar — the gear plus lettering is detailed
enough that it needs that room.

## Deliberately unchanged

- Message and tool-row layout: `ToolDisclosure` is already one line with one
  chevron.
- The session context menu: the only entry point for rename/tags/pin/archive/
  delete, so it is not duplication.
- The model/thinking dropdowns next to the composer: closest to the send action,
  so they are the copy worth keeping.
- Fork and clone: fork has two other entry points, but the toolbar button is the
  handiest one for the current session; clone has no other entry point at all.
- The timeline: kept per explicit request, rendered with the stock
  `ConversationTimeline` structure (`nav > ol > li > button.timeline-node`).

## Layout

```
src/
  data.ts              fixed dataset + transcript
  shared.tsx           traced rpi mark, tool row
  App.tsx              shell, view switch, findings table
  shell.css            header + diff view
  native/
    NativeApp.tsx      reproduction of the current sidebar/toolbar/composer
    NativePanels.tsx   the four mutually exclusive right-hand panels
    *.css              copied verbatim from the preview build
  slim/
    SlimApp.tsx        reduced chrome
    ModelMenu.tsx      model picker with the runtime entry on top
    RuntimePanel.tsx   the full runtime panel
    RecentChats.tsx    the floating recent-chats window
    ChatSearch.tsx     cross-session search (Ctrl / ⌘ K)
    slim.css           only the new nodes
```
