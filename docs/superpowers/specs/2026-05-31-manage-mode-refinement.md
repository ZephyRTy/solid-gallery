# Manage Mode Interaction & Style Refinement

## Scope

Simplify manage mode entry/exit to a single always-visible bottom bar with dual states. Remove duplicate entry points (PageToolbar, TopBar button). Add visual transitions for mode switching.

## 1. SelectionBar Dual-State Redesign

### States

| State | isManaging | Content | Style |
|-------|-----------|---------|-------|
| Collapsed | `false` | "选择" label + pill toggle on the right | Thin bar (h-10), transparent/semi-transparent bg |
| Expanded | `true` | "已选 N 个" + [全选/取消] + [移动到文件夹] + toggle on right | Full bar (h-14), white bg, border-t, shadow |

### Pill Toggle

- Width 36px (`w-9`), height 20px (`h-5`), fully rounded (`rounded-full`)
- Track: `bg-stone-200` (off) / `bg-accent-violet` (on), transition 200ms
- Thumb: white circle `w-4 h-4`, absolute positioned, `translate-x-0.5` (off) / `translate-x-[18px]` (on)
- "选择" text label to the left of the pill, `text-xs text-stone-400`

### Buttons (expanded state only)

- "全选 / 取消" — dispatches Ctrl+A keyboard event (existing behavior)
- "移动到文件夹" — opens FolderDrawer, disabled when count is 0
- Remove "批量星标" placeholder button

### Animation

- Collapsed → Expanded: bar height transitions via `animate-slide-up`
- The toggle stays in the same position during transition (pinned right)

## 2. Delete PageToolbar

- Remove `src/components/page-toolbar/index.tsx`
- Remove import and JSX from `src/components/pages/index.tsx`

## 3. Remove TopBar Toggle Button

- Remove the checkmark SVG button from `src/components/top-bar/index.tsx`
- Window controls move back to their original `gap-1` layout (no select button gap)

## 4. Card Visual Transition

### Normal mode
- Info bar: `from-black/50 via-black/20 to-transparent`
- No ring

### Manage mode (additional classes when `signalStore.isManaging()` is true)
- Info bar: `from-violet-600/50 via-violet-600/20 to-transparent`
- Card: `ring-1 ring-stone-200`

Changes are in `src/components/image-components/index-item.tsx`:
- Gradient classes via `classList` bound to `signalStore.isManaging()`
- Ring class via `classList` bound to `signalStore.isManaging()`

## 5. File Changes

| Action | File |
|--------|------|
| MODIFY | `src/components/selection-bar/index.tsx` — dual-state redesign with pill toggle |
| DELETE | `src/components/page-toolbar/index.tsx` |
| MODIFY | `src/components/pages/index.tsx` — remove PageToolbar import/render |
| MODIFY | `src/components/top-bar/index.tsx` — remove select toggle button |
| MODIFY | `src/components/image-components/index-item.tsx` — add mode-dependent card styling |

## 6. What Stays

- FolderDrawer — no changes
- Escape key exit — no changes (plus toggle and bottom bar exit are the 3 exit methods)
- `signalStore.isManaging` and `signalStore.selectedPacks` — no changes
- All other select-mode behaviors (checkbox, Ctrl+A) — no changes
