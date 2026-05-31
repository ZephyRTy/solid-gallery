# Manage Mode Interaction Refinement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify manage mode to a single always-visible bottom bar with collapsed/expanded dual state. Remove duplicate entry points. Add visual card transitions on mode switch.

**Architecture:** `SelectionBar` becomes always-visible with a pill toggle. Collapsed state shows only the toggle; expanded state shows full batch operations. `PageToolbar` is deleted. `TopBar` toggle button removed. `PackItem` gradient and ring react to `isManaging`.

**Tech Stack:** SolidJS, Tailwind CSS

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| REWRITE | `src/components/selection-bar/index.tsx` | Dual-state bar with pill toggle |
| DELETE | `src/components/page-toolbar/index.tsx` | Removed |
| MODIFY | `src/components/pages/index.tsx` | Remove PageToolbar import/render |
| MODIFY | `src/components/top-bar/index.tsx` | Remove select toggle button |
| MODIFY | `src/components/image-components/index-item.tsx` | Mode-dependent gradient + ring |

---

### Task 1: Rewrite SelectionBar with dual-state and pill toggle

**Files:**
- Modify: `src/components/selection-bar/index.tsx`

- [ ] **Step 1: Replace SelectionBar with dual-state implementation**

Read the current file, then replace entire content:

```tsx
import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';

export const SelectionBar: Component = () => {
  return (
    <div
      class="fixed bottom-0 inset-x-0 z-overlay transition-all duration-300"
      classList={{
        'h-14 bg-white border-t border-stone-200 shadow-xl': signalStore.isManaging(),
        'h-10 bg-white/80 backdrop-blur-sm': !signalStore.isManaging(),
      }}
    >
      <div class="h-full flex items-center justify-between px-6">
        {/* Left: count (only when managing) */}
        <Show
          when={signalStore.isManaging()}
          fallback={<span />}
        >
          <span class="text-sm text-stone-500 tabular-nums">
            已选 {signalStore.selectedPacks().length} 个
          </span>
        </Show>

        {/* Right: actions + toggle */}
        <div class="flex items-center gap-3 ml-auto">
          <Show when={signalStore.isManaging()}>
            <button
              aria-label="Select all"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }),
                );
              }}
              class="h-9 px-4 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors"
            >
              全选 / 取消
            </button>
            <button
              aria-label="Move to folder"
              onClick={() => {
                signalStore.drawerVisible.set(true);
              }}
              disabled={!signalStore.selectedPacks().length}
              class="h-9 px-4 rounded-lg text-sm font-medium text-white bg-accent-violet hover:bg-violet-600 transition-colors disabled:opacity-40"
            >
              移动到文件夹
            </button>
          </Show>

          {/* Pill toggle */}
          <button
            aria-label={signalStore.isManaging() ? '退出选择模式' : '选择模式'}
            onClick={() => signalStore.isManaging.set((v) => !v)}
            class="flex items-center gap-2 group"
          >
            <span class="text-xs text-stone-400 group-hover:text-stone-600 transition-colors select-none">
              选择
            </span>
            <span
              class="relative inline-flex w-9 h-5 rounded-full transition-colors duration-200"
              classList={{
                'bg-accent-violet': signalStore.isManaging(),
                'bg-stone-200': !signalStore.isManaging(),
              }}
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                classList={{
                  'translate-x-[18px]': signalStore.isManaging(),
                  'translate-x-0.5': !signalStore.isManaging(),
                }}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/selection-bar/index.tsx
git commit -m "refactor: dual-state SelectionBar with pill toggle, always visible"
```

---

### Task 2: Delete PageToolbar

**Files:**
- Delete: `src/components/page-toolbar/index.tsx`

- [ ] **Step 1: Delete the file**

```bash
Remove-Item -Force "src/components/page-toolbar/index.tsx"
```

- [ ] **Step 2: Remove directory if empty**

```bash
if (@(Get-ChildItem "src/components/page-toolbar" -ErrorAction SilentlyContinue).Count -eq 0) { Remove-Item "src/components/page-toolbar" }
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: delete PageToolbar, entry moved to SelectionBar"
```

---

### Task 3: Remove PageToolbar from IndexPage

**Files:**
- Modify: `src/components/pages/index.tsx`

- [ ] **Step 1: Remove import and JSX**

Read the current file. Make two edits:

1. Remove line: `import { PageToolbar } from '../page-toolbar';`
2. Remove line: `<PageToolbar />`

- [ ] **Step 2: Commit**

```bash
git add src/components/pages/index.tsx
git commit -m "refactor: remove PageToolbar import and render from IndexPage"
```

---

### Task 4: Remove select toggle button from TopBar

**Files:**
- Modify: `src/components/top-bar/index.tsx`

- [ ] **Step 1: Replace TopBar content**

Read the current file, then replace entire content:

```tsx
import { Component, Show } from 'solid-js';
import { SearchBar } from '../search-bar';
import signalStore from '../../utils/shared-signal';
const { ipcRenderer } = window.require('electron');

export const TopBar: Component<{ isPackPage: boolean }> = (props) => {
  return (
    <div class="relative top-bar h-10 shrink-0 flex items-center px-6">
      <Show when={!props.isPackPage}>
        <SearchBar />
      </Show>
      <h1 class="flex-1 text-center text-sm text-stone-400 tracking-wider select-none">
        {signalStore.title()}
      </h1>
      <div class="flex items-center gap-1 no-drag ml-auto">
        <button
          aria-label="Minimize"
          onClick={() => ipcRenderer.send('min')}
          class="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
        />
        <button
          aria-label="Maximize"
          onClick={() => ipcRenderer.send('max')}
          class="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
        />
        <button
          aria-label="Close"
          onClick={() => ipcRenderer.send('close')}
          class="w-3 h-3 rounded-full bg-accent-rose hover:bg-rose-600 transition-colors btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/top-bar/index.tsx
git commit -m "refactor: remove select toggle button from TopBar"
```

---

### Task 5: Add mode-dependent card styling to PackItem

**Files:**
- Modify: `src/components/image-components/index-item.tsx`

- [ ] **Step 1: Add mode-dependent gradient and ring to card**

Read the current file. Make these specific edits:

1. **Lines 70-73** — Add `ring-1 ring-transparent` base class, add `classList` entries for mode-dependent ring:

Change the card div's `class` from:
```tsx
      class="group relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 cursor-pointer
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200
        focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2
        animate-fade-in"
      classList={{
        'ring-2 ring-accent-violet': signalStore.isManaging() && selected(),
      }}
```

To:
```tsx
      class="group relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 cursor-pointer
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200
        focus-visible:ring-2 focus-visible:ring-accent-violet focus-visible:ring-offset-2
        animate-fade-in"
      classList={{
        'ring-2 ring-accent-violet': signalStore.isManaging() && selected(),
        'ring-1 ring-stone-200': signalStore.isManaging() && !selected(),
      }}
```

2. **Line 121** — Add `classList` to the info bar div for gradient switch. Change:

From:
```tsx
      <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
```

To:
```tsx
      <div
        class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t via-black/20 to-transparent transition-colors duration-300"
        classList={{
          'from-black/50': !signalStore.isManaging(),
          'from-violet-600/50': signalStore.isManaging(),
          'via-violet-600/20': signalStore.isManaging(),
          'via-black/20': !signalStore.isManaging(),
        }}
      >
```

- [ ] **Step 2: Commit**

```bash
git add src/components/image-components/index-item.tsx
git commit -m "feat: mode-dependent card ring and gradient for manage mode"
```

---

### Task 6: Lint + Build verification

**Files:** (verification only)

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: 0 errors. Warnings from pre-existing unused-vars are acceptable.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit fixes if needed**

Only if lint/build revealed issues.

---

## Self-Review

1. **Spec coverage:** SelectionBar dual-state (Task 1), PageToolbar deletion (Task 2+3), TopBar cleanup (Task 4), card transitions (Task 5), verification (Task 6). All 5 spec sections covered.
2. **No placeholders:** All tasks have concrete code.
3. **Type consistency:** Pill toggle uses `classList` with reactive `signalStore.isManaging()`. Card gradient uses `classList` dict pattern consistent with SolidJS. Ring uses `classList` with compound condition.
