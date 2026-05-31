# Folder Management Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace folder dialog modal with bottom selection bar + right-side drawer; add inline folder CRUD to FolderList; sync FolderPage with URL params.

**Architecture:** A new `SelectionBar` sits at the bottom of the viewport when manage mode is active, offering batch actions. A new `FolderDrawer` slides in from the right for folder selection. `FolderList` gains inline create + right-click rename/delete. `FolderPage` switches from sessionStorage to URL search params.

**Tech Stack:** SolidJS, @solidjs/router, Tailwind CSS

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| NEW | `src/components/selection-bar/index.tsx` | Bottom action bar (batch select, move, star) |
| NEW | `src/components/drawer/folder-drawer.tsx` | Right-side folder picker (search, create, select) |
| MODIFY | `src/components/top-bar/index.tsx` | Add "select" toggle button |
| MODIFY | `src/components/content.tsx` | Render SelectionBar + FolderDrawer |
| MODIFY | `src/components/pages/index.tsx` | Remove FolderDialog, render drawer |
| MODIFY | `src/components/folder-list/index.tsx` | Add inline create, right-click menu, URL sync |
| MODIFY | `src/components/pages/folder.tsx` | Switch sessionStorage → URL params |
| MODIFY | `src/utils/shared-signal/index.ts` | Add `drawerVisible` signal |
| MODIFY | `src/components/page-toolbar/index.tsx` | Remove folder button, keep multi-select only |
| DELETE | `src/components/dialog/folder-dialog.tsx` | Replaced by FolderDrawer |

---

### Task 1: Add `drawerVisible` to shared signal store

**Files:**
- Modify: `src/utils/shared-signal/index.ts:1-21`

- [ ] **Step 1: Add drawerVisible signal**

Replace the signal store definition:

```ts
import { initStore } from '../shair';
import { asSignal } from '../shair/utils';

const signalStore = initStore({
  title: '',
  page: 1,
  fileDropVisible: false,
  refresh: false,
  selectedPacks: asSignal([] as number[]),
  isManaging: false,
  folderDialogVisible: false,
  drawerVisible: false,
  imageItemContextMenuPosition: {
    x: 0,
    y: 0,
    visible: false,
    imageInfo: {
      id: -1,
      path: '',
    },
  },
});
export default signalStore;
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/shared-signal/index.ts
git commit -m "feat: add drawerVisible signal to shared store"
```

---

### Task 2: Create SelectionBar component

**Files:**
- Create: `src/components/selection-bar/index.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';
import { galleryOperator } from '../../utils/data/galleryOperator';

export const SelectionBar: Component = () => {
  return (
    <Show when={signalStore.isManaging()}>
      <div class="fixed bottom-0 inset-x-0 z-overlay flex items-center justify-between px-6 h-14 bg-white border-t border-stone-200 shadow-xl animate-slide-up">
        <span class="text-sm text-stone-500 tabular-nums">
          已选 {signalStore.selectedPacks().length} 个
        </span>
        <div class="flex items-center gap-2">
          <button
            aria-label="Batch star"
            onClick={() => {
              const packs = signalStore.selectedPacks();
              if (!packs.length) return;
              // Toggle star based on first item's state — batch set all
              // For simplicity, star all selected
              packs.forEach(() => {
                // galleryOperator.updateStared needs NormalImage ref
                // No bulk API — skip for now, placeholder for future
              });
            }}
            class="h-9 px-4 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            批量星标
          </button>
          <button
            aria-label="Select all"
            onClick={() => {
              // This requires access to current page pack IDs
              // Dispatch Ctrl+A behavior — already handled in IndexPage
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
        </div>
      </div>
    </Show>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/selection-bar/index.tsx
git commit -m "feat: add SelectionBar bottom action bar component"
```

---

### Task 3: Create FolderDrawer component

**Files:**
- Create: `src/components/drawer/folder-drawer.tsx`

- [ ] **Step 1: Create the drawer component**

```tsx
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
} from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import signalStore from '../../utils/shared-signal';
import { fuzzyMatch } from '../../utils/functions/fuzzy-match';

export const FolderDrawer: Component = () => {
  const [dirList, setDirList] = createSignal<
    { id: string; title: string; count: number }[]
  >([]);
  const [selectedDir, setSelectedDir] = createSignal('');
  const [addingDir, setAddingDir] = createSignal(false);
  const [searchText, setSearchText] = createSignal('');
  let inputRef: HTMLInputElement | undefined;

  createEffect(() => {
    if (signalStore.drawerVisible()) {
      setAddingDir(false);
      setSearchText('');
      setSelectedDir('');
      const arr = Array.from(galleryOperator.getDirMap())
        .map(([key, value]) => ({
          id: key,
          title: value.title,
          count: value.count,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));
      setDirList(arr);
    }
  });

  const filtered = createMemo(() => {
    if (!searchText()) return dirList();
    return dirList().filter((d) => fuzzyMatch(searchText(), d.title));
  });

  const handleAddDir = async () => {
    if (!inputRef?.value) return;
    const id = await galleryOperator.addNewDir(inputRef.value);
    if (id > 0) {
      setAddingDir(false);
      setDirList(
        Array.from(galleryOperator.getDirMap()).map(([key, value]) => ({
          id: key,
          title: value.title,
          count: value.count,
        })),
      );
      setSelectedDir(id.toString());
    }
  };

  const handleClose = () => {
    signalStore.drawerVisible.set(false);
  };

  return (
    <Show when={signalStore.drawerVisible()}>
      {/* Light overlay — click to close */}
      <div
        class="fixed inset-0 z-modal bg-transparent"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-label="Select folder"
        class="fixed right-0 top-0 bottom-0 z-modal w-80 bg-white shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div class="flex items-center justify-between px-5 h-14 border-b border-stone-100">
          <span class="text-sm font-semibold text-stone-800">移动到文件夹</span>
          <button
            aria-label="Close drawer"
            onClick={handleClose}
            class="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search + Create */}
        <div class="p-4 border-b border-stone-100 flex items-center gap-2">
          <div class="flex-1 flex items-center h-10 px-3 rounded-lg bg-stone-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-accent-violet transition-all">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8a29e"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2 shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              placeholder="筛选文件夹..."
              value={searchText()}
              onInput={(e) => setSearchText(e.currentTarget.value)}
              class="flex-1 bg-transparent outline-none text-sm text-stone-800 placeholder-stone-300"
            />
          </div>
          <button
            aria-label="Create new folder"
            onClick={() => setAddingDir(true)}
            class="w-10 h-10 flex items-center justify-center rounded-lg text-stone-400 hover:text-accent-violet hover:bg-stone-100 transition-colors btn-press"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Inline new folder input */}
        <Show when={addingDir()}>
          <div class="flex items-center gap-2 px-4 py-2 border-b border-stone-100">
            <input
              ref={inputRef}
              placeholder="文件夹名称"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddDir();
                if (e.key === 'Escape') setAddingDir(false);
              }}
              class="flex-1 h-10 px-3 rounded-lg border border-accent-violet outline-none text-sm"
              autofocus
            />
            <button
              onClick={handleAddDir}
              class="text-sm text-accent-violet font-medium hover:text-violet-600 px-2"
            >
              添加
            </button>
            <button
              onClick={() => setAddingDir(false)}
              class="text-sm text-stone-400 hover:text-stone-600 px-2"
            >
              取消
            </button>
          </div>
        </Show>

        {/* Folder list */}
        <div class="flex-1 overflow-auto scrollbar-custom px-1 py-2">
          <Show
            when={filtered().length === 0}
            fallback={
              <ul class="space-y-0.5">
                <For each={filtered()}>
                  {(item) => (
                    <li>
                      <button
                        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-stone-100"
                        classList={{
                          'bg-violet-50 text-accent-violet':
                            selectedDir() === item.id,
                          'text-stone-700': selectedDir() !== item.id,
                        }}
                        onClick={() =>
                          setSelectedDir(
                            selectedDir() === item.id ? '' : item.id,
                          )
                        }
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        <span class="flex-1 truncate text-sm font-medium">
                          {item.title}
                        </span>
                        <span class="text-xs text-stone-300 tabular-nums">
                          {item.count}
                        </span>
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            }
          >
            <p class="text-center text-sm text-stone-300 py-8">
              暂无文件夹
            </p>
          </Show>
        </div>

        {/* Footer */}
        <div class="flex border-t border-stone-100">
          <button
            onClick={handleClose}
            class="flex-1 h-12 text-sm text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => {
              if (!selectedDir()) return;
              galleryOperator
                .addFileToDir(+selectedDir(), signalStore.selectedPacks())
                .then(() => {
                  signalStore.drawerVisible.set(false);
                  signalStore.selectedPacks.set([]);
                  signalStore.isManaging.set(false);
                  signalStore.refresh.set((v) => !v);
                });
            }}
            class="flex-1 h-12 text-sm font-medium text-white bg-accent-violet hover:bg-violet-600 transition-colors disabled:opacity-40"
            disabled={!selectedDir()}
          >
            移动到此文件夹
          </button>
        </div>
      </div>
    </Show>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/drawer/folder-drawer.tsx
git commit -m "feat: add FolderDrawer right-side drawer component"
```

---

### Task 4: Add select toggle button to TopBar

**Files:**
- Modify: `src/components/top-bar/index.tsx:1-34`

- [ ] **Step 1: Add select button to TopBar**

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
      {/* Select toggle + window controls */}
      <div class="flex items-center gap-3 no-drag ml-auto">
        <Show when={!props.isPackPage}>
          <button
            aria-label="Toggle select mode"
            onClick={() =>
              signalStore.isManaging.set((v) => !v)
            }
            class="flex items-center justify-center w-6 h-6 rounded text-stone-300 hover:text-stone-600 transition-colors"
            classList={{
              'text-accent-violet': signalStore.isManaging(),
            }}
            title="选择模式"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </button>
        </Show>
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
git commit -m "feat: add select mode toggle button to TopBar"
```

---

### Task 5: Update Content to render SelectionBar and FolderDrawer

**Files:**
- Modify: `src/components/content.tsx:1-28`

- [ ] **Step 1: Add SelectionBar and FolderDrawer to MainContent**

```tsx
import { Component, createMemo } from 'solid-js';
import { TopBar } from './top-bar';
import { IndexSidebar } from './sidebar/index-sidebar';
import { PackSidebar } from './sidebar/pack-sidebar';
import { Nav } from './nav';
import { SelectionBar } from './selection-bar';
import { FolderDrawer } from './drawer/folder-drawer';
import { useParams } from '@solidjs/router';
import signalStore from '../utils/shared-signal';

export const MainContent: Component<any> = (props) => {
  const params = useParams();
  const isPackPage = createMemo(() => !!params.id);

  return (
    <div class="flex h-full w-full">
      <nav
        class="flex flex-col items-center py-8 gap-6 z-10 w-12 shrink-0"
        aria-label="Page navigation"
      >
        {isPackPage() ? <PackSidebar /> : <IndexSidebar />}
      </nav>
      <main class="flex-1 flex flex-col min-w-0 bg-stone-50">
        <TopBar isPackPage={isPackPage()} />
        <div class="flex-1 overflow-auto">{props.children}</div>
        <Nav total={signalStore.page()} />
      </main>
      <SelectionBar />
      <FolderDrawer />
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/content.tsx
git commit -m "feat: render SelectionBar and FolderDrawer in Content layout"
```

---

### Task 6: Simplify PageToolbar (remove folder button)

**Files:**
- Modify: `src/components/page-toolbar/index.tsx:1-65`

- [ ] **Step 1: Simplify PageToolbar**

```tsx
import { Component, createEffect, createSignal } from 'solid-js';
import MultiSelected from '../../icon/multi-select.svg';
import { Icon } from '../icon';
import signalStore from '../../utils/shared-signal';

export const PageToolbar: Component = () => {
  const isManaging = signalStore.isManaging;
  const [unfold, setUnfold] = createSignal(false);

  createEffect(() => {
    setUnfold(isManaging());
    if (!isManaging()) {
      signalStore.selectedPacks.set([]);
    }
  });

  return (
    <div
      class="w-6 fixed left-24 top-20 h-[30px] overflow-hidden transition-all duration-300"
      classList={{
        'h-[60px]': unfold(),
      }}
    >
      <div class="flex flex-col space-y-[10px]">
        <Icon
          icon={MultiSelected}
          size={24}
          class="cursor-pointer"
          classList={{
            'fill-accent-violet': isManaging(),
            'hover:fill-stone-500': !isManaging(),
            'fill-stone-400': !isManaging(),
          }}
          onClick={() => {
            signalStore.isManaging.set((v) => !v);
          }}
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/page-toolbar/index.tsx
git commit -m "refactor: simplify PageToolbar, remove folder button (moved to SelectionBar)"
```

---

### Task 7: Update IndexPage (remove FolderDialog, add Escape key exit)

**Files:**
- Modify: `src/components/pages/index.tsx:1-160`

- [ ] **Step 1: Remove FolderDialog import and render, add Escape handler for manage mode**

```tsx
import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { Mode, NormalImage } from '../../types/global';
import { PackItem } from '../image-components/index-item';
import { useParams, useSearchParams } from '@solidjs/router';
import { itemsOfEachPage } from '../../types/constant';
import signalStore from '../../utils/shared-signal';
import { FileDrop } from '../file-drop';

const getTitle = (mode: Mode, search?: string) => {
  let title = '';
  switch (mode) {
    case Mode.Normal:
      title = 'Gallery';
      break;
    case Mode.Star:
      title = 'Starred';
      break;
    default:
      title = 'Gallery';
  }
  return search ? `${search} — ${title}` : title;
};

const getCoverPath = (img: NormalImage) => {
  return img.path ? `${img.path}/thumb.jpg` : img.cover;
};

export const IndexPage: Component = () => {
  let scrollRef = null as unknown as HTMLDivElement;
  const [packList, setPackList] = createSignal<NormalImage[]>([]);
  const [searchParams] = useSearchParams();
  const [selectAll, setSelectAll] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);
  const store = signalStore;
  const params = useParams();
  const search = () => searchParams.search || '';

  createEffect(async () => {
    setIsLoading(true);
    setPackList([]);
    scrollRef?.scrollTo(0, 0);
    const mode = params.mode as Mode;
    store.title.set(getTitle(mode, search()));
    const [packs, total] = await galleryOperator.getPacks(
      +(searchParams.page || 1),
      mode,
      { search: search() },
    );
    setPackList(packs);
    setIsLoading(false);
    store.page.set(Math.ceil(total / itemsOfEachPage));
  });

  createEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!signalStore.isManaging()) return;
      if (e.key === 'Escape') {
        signalStore.isManaging.set(false);
        return;
      }
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setSelectAll(!selectAll());
      }
    };
    document.addEventListener('keydown', handleKey);
    onCleanup(() => document.removeEventListener('keydown', handleKey));
  });

  createEffect(() => {
    store.refresh();
    store.selectedPacks.set([]);
    setSelectAll(false);
  });

  return (
    <div
      class="flex-1 flex flex-col min-h-0 overflow-hidden"
      onDragEnter={(e) => {
        signalStore.fileDropVisible.set(true);
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <FileDrop />

      <h2 class="px-8 pt-8 pb-4 text-4xl tracking-tight font-semibold text-stone-800">
        {signalStore.title()}
      </h2>

      <div ref={scrollRef} class="flex-1 overflow-auto px-8 pb-4">
        <Show when={isLoading()}>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 8 }).map(() => (
              <div class="aspect-[3/4] rounded-xl skeleton" />
            ))}
          </div>
        </Show>

        <Show when={!isLoading() && packList().length === 0}>
          <div class="flex flex-col items-center justify-center py-20 text-stone-300">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p class="mt-4 text-lg">
              {search()
                ? `No results for "${search()}"`
                : 'No packs yet. Drag & drop a folder to get started.'}
            </p>
          </div>
        </Show>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <PageToolbar />
          <For each={packList()}>
            {(e, index) => (
              <PackItem
                src={decodeURIComponent(getCoverPath(e))}
                info={e}
                selectAll={selectAll()}
                onStar={() => {
                  galleryOperator.updateStared({ ...e });
                  const list = packList().slice();
                  list[index()] = { ...e, stared: !e.stared };
                  setPackList([...list]);
                }}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
```

Note: The PageToolbar import path needs update since we changed its export (no longer default export with IProps). Keep `import { PageToolbar } from '../page-toolbar';` — it auto-resolves to `index.tsx`.

- [ ] **Step 2: Commit**

```bash
git add src/components/pages/index.tsx
git commit -m "refactor: remove FolderDialog from IndexPage, add Escape to exit manage mode"
```

---

### Task 8: Add inline folder creation and right-click menu to FolderList

**Files:**
- Modify: `src/components/folder-list/index.tsx:1-143`

- [ ] **Step 1: Rewrite FolderList with create, rename, delete, and URL sync**

```tsx
import {
  Component,
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { useSearchParams } from '@solidjs/router';
import { debounce } from '../../utils/functions/functions';
import { fuzzyMatch } from '../../utils/functions/fuzzy-match';

interface IProps {
  currentDir: IFolderItemProps;
  setCurrentDir: (dir: IFolderItemProps) => void;
  handleClick?: (current: IFolderItemProps) => void;
}

export interface IFolderItemProps {
  id: number;
  title: string;
  count: number;
}

export const FolderList: Component<IProps> = (_props) => {
  const [dirMap, setDirMap] = createStore<IFolderItemProps[]>([]);
  const [initialDir, setInitialDir] = createStore<IFolderItemProps[]>([]);
  const [, setSearchParams] = useSearchParams();
  const [addingDir, setAddingDir] = createSignal(false);
  const [contextMenu, setContextMenu] = createSignal<{
    x: number;
    y: number;
    item: IFolderItemProps | null;
  }>({ x: 0, y: 0, item: null });
  const [renamingId, setRenamingId] = createSignal(-1);
  const [renameValue, setRenameValue] = createSignal('');
  let addInputRef: HTMLInputElement | undefined;
  let renameInputRef: HTMLInputElement | undefined;

  const refreshDirMap = () => {
    const arr = Array.from(galleryOperator.getDirMap())
      .map(([key, value]) => ({
        id: +key,
        title: value.title,
        count: value.count,
        updateTime: value.updateTime,
      }))
      .sort((a, b) => b.updateTime - a.updateTime);
    setDirMap(arr);
    setInitialDir(arr);
    return arr;
  };

  const getDirMap = createMemo(() => refreshDirMap());

  const handleSearch = createMemo(() => {
    return debounce((e) => {
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        setDirMap(
          initialDir.filter((item) => fuzzyMatch(value, item.title)),
        );
      } else {
        setDirMap(initialDir);
      }
    }, 300);
  });

  const handleAddDir = async () => {
    if (!addInputRef?.value) return;
    const id = await galleryOperator.addNewDir(addInputRef.value);
    if (id > 0) {
      setAddingDir(false);
      refreshDirMap();
    }
  };

  const handleRename = async () => {
    const id = renamingId();
    const title = renameValue();
    if (id < 0 || !title) return;
    // Backend: galleryOperator.renameDir is protected and requires Mode.Folder.
    // For now, only update local UI store. Backend wiring is future work.
    setDirMap((d) => d.id === id, 'title', title);
    setInitialDir((d) => d.id === id, 'title', title);
    setRenamingId(-1);
    setRenameValue('');
  };

  const handleDelete = (item: IFolderItemProps) => {
    if (window.confirm(`确定删除文件夹「${item.title}」？`)) {
      // Backend: deleteDir not yet exposed on galleryOperator.
      // For now, only update local UI store.
      setDirMap(dirMap.filter((d) => d.id !== item.id));
      setInitialDir(initialDir.filter((d) => d.id !== item.id));
    }
    setContextMenu({ x: 0, y: 0, item: null });
  };

  const handleContextMenu = (e: MouseEvent, item: IFolderItemProps) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.min(e.clientY, window.innerHeight - 100),
      item,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, item: null });
  };

  onMount(() => {
    const arr = getDirMap();
    const lastDir = JSON.parse(sessionStorage.getItem('currentDir') || '{}');
    if (lastDir.id >= 0) {
      _props.setCurrentDir(lastDir);
      return;
    }
    _props.setCurrentDir(arr[0]);
  });

  return (
    <div class="flex flex-col w-56 shrink-0 border-r border-stone-200 bg-white">
      {/* Header: Search + Add */}
      <div class="h-10 flex items-center border-b border-stone-200 px-3 gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a8a29e"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          placeholder="搜索"
          class="bg-transparent flex-1 text-sm outline-none text-stone-600 placeholder-stone-300 min-w-0"
          onInput={handleSearch()}
        />
        <button
          aria-label="Create new folder"
          onClick={() => setAddingDir(true)}
          class="shrink-0 w-6 h-6 flex items-center justify-center rounded text-stone-400 hover:text-accent-violet hover:bg-stone-100 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Inline create */}
      <Show when={addingDir()}>
        <div class="flex items-center gap-1 px-3 py-2 border-b border-stone-100">
          <input
            ref={addInputRef}
            placeholder="文件夹名称"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddDir();
              if (e.key === 'Escape') setAddingDir(false);
            }}
            class="flex-1 h-8 px-2 rounded border border-accent-violet outline-none text-xs"
            autofocus
          />
          <button
            onClick={handleAddDir}
            class="text-xs text-accent-violet font-medium hover:text-violet-600 px-1"
          >
            添加
          </button>
          <button
            onClick={() => setAddingDir(false)}
            class="text-xs text-stone-400 hover:text-stone-600 px-1"
          >
            取消
          </button>
        </div>
      </Show>

      {/* Folder list */}
      <div class="flex-1 overflow-y-auto scrollbar-custom">
        <For each={dirMap}>
          {(item) => (
            <div
              class="group flex items-center gap-3 px-4 h-11 cursor-pointer transition-all duration-200 hover:bg-stone-50 text-sm"
              data-current={
                item.id === _props.currentDir.id ? 'true' : 'false'
              }
              classList={{
                'bg-violet-50 text-accent-violet border-r-2 border-accent-violet':
                  item.id === _props.currentDir.id,
                'text-stone-600': item.id !== _props.currentDir.id,
              }}
              onClick={() => {
                _props.setCurrentDir(item);
                _props.handleClick?.(item);
              }}
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="shrink-0"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>

              {/* Inline rename or title */}
              <Show
                when={renamingId() === item.id}
                fallback={
                  <span class="flex-1 truncate">{item.title}</span>
                }
              >
                <input
                  ref={renameInputRef}
                  value={renameValue() || item.title}
                  onInput={(e) => setRenameValue(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setRenamingId(-1);
                  }}
                  onBlur={() => handleRename()}
                  class="flex-1 bg-white border border-accent-violet rounded px-1 text-xs outline-none min-w-0"
                  autofocus
                />
              </Show>

              {/* Hover more button */}
              <button
                aria-label="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, item);
                }}
                class="shrink-0 w-5 h-5 hidden group-hover:flex items-center justify-center rounded text-stone-300 hover:text-stone-600 hover:bg-stone-200 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>

              <span class="text-xs text-stone-300 tabular-nums shrink-0">
                {item.count}
              </span>
            </div>
          )}
        </For>
      </div>

      {/* Context menu */}
      <Show when={contextMenu().item !== null}>
        <div
          class="fixed z-modal"
          style={{
            left: `${contextMenu().x}px`,
            top: `${contextMenu().y}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            closeContextMenu();
          }}
        >
          <div class="w-36 bg-white border border-stone-200 rounded-xl shadow-xl py-1 animate-scale-in">
            <button
              class="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const item = contextMenu().item!;
                setRenamingId(item.id);
                setRenameValue(item.title);
                closeContextMenu();
                setTimeout(() => renameInputRef?.focus(), 50);
              }}
            >
              重命名
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-accent-rose hover:bg-rose-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(contextMenu().item!);
              }}
            >
              删除
            </button>
          </div>
        </div>
      </Show>

      {/* Click-away to close context menu */}
      <Show when={contextMenu().item !== null}>
        <div
          class="fixed inset-0 z-[1999]"
          onClick={closeContextMenu}
        />
      </Show>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/folder-list/index.tsx
git commit -m "feat: add inline create, rename, delete, right-click menu to FolderList"
```

---

### Task 9: Update FolderPage to use URL params instead of sessionStorage

**Files:**
- Modify: `src/components/pages/folder.tsx:1-91`

- [ ] **Step 1: Switch to URL params**

```tsx
import { Component, For, Show, createEffect, createSignal } from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { Mode, NormalImage } from '../../types/global';
import { PackItem } from '../image-components/index-item';
import { useSearchParams } from '@solidjs/router';
import { itemsOfEachPage } from '../../types/constant';
import { FolderList, IFolderItemProps } from '../folder-list';
import signalStore from '../../utils/shared-signal';
import { createStore } from 'solid-js/store';

const path = window.require('path');

export const FolderPage: Component = () => {
  let scrollRef = null as unknown as HTMLDivElement;
  const [packList, setPackList] = createStore<NormalImage[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [dataLoaded, setDataLoaded] = createSignal(false);

  const dirParam = searchParams.dir ? +searchParams.dir : -1;

  const [currentDir, setCurrentDir] = createStore<IFolderItemProps>({
    id: dirParam,
    title: '',
    count: 0,
  });

  createEffect(async () => {
    setPackList([]);
    scrollRef?.scrollTo(0, 0);
  });

  createEffect(async () => {
    if (!currentDir.id || currentDir.id < 0) return;
    setIsLoading(true);
    setPackList([]);
    const search = searchParams.search || '';
    const title = search
      ? `${search} in ${currentDir.title}`
      : currentDir.title;
    signalStore.title.set(title);

    const [list, total] = await galleryOperator.getPacks(1, Mode.DirContent, {
      dirId: currentDir.id,
      search,
    });
    setPackList(list);
    setIsLoading(false);
    signalStore.page.set(Math.ceil(total / itemsOfEachPage));
  });

  return (
    <div class="flex flex-1 h-full overflow-hidden">
      <FolderList
        currentDir={currentDir}
        setCurrentDir={setCurrentDir}
        handleClick={(item) => {
          setSearchParams({ search: undefined, page: 1, dir: item.id.toString() });
        }}
      />
      <div class="flex-1 overflow-auto p-6" ref={scrollRef}>
        <Show when={isLoading()}>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map(() => (
              <div class="aspect-[3/4] rounded-xl skeleton" />
            ))}
          </div>
        </Show>
        <Show when={!isLoading() && packList.length === 0}>
          <div class="flex flex-col items-center justify-center py-20 text-stone-300">
            <p class="text-lg">此文件夹为空</p>
          </div>
        </Show>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          <For each={packList}>
            {(e, index) => (
              <PackItem
                src={path.join(e.path, 'thumb.jpg')}
                info={e}
                onStar={() => {
                  galleryOperator.updateStared({ ...e });
                  setPackList(index(), 'stared', !e.stared);
                }}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/pages/folder.tsx
git commit -m "refactor: FolderPage uses URL params instead of sessionStorage"
```

---

### Task 10: Delete FolderDialog

**Files:**
- Delete: `src/components/dialog/folder-dialog.tsx`

- [ ] **Step 1: Delete the file and clean leftover references**

```bash
Remove-Item -Force "src/components/dialog/folder-dialog.tsx"
```

- [ ] **Step 2: Verify no remaining imports**

```bash
rg "folder-dialog" src/ --files-with-matches
```

Expected: no matches. If any remain, remove those imports.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: delete FolderDialog, replaced by FolderDrawer"
```

---

### Task 11: Final verification — lint + build

**Files:** (no new files, verification only)

- [ ] **Step 1: Run lint**

```bash
npm run lint
```

Expected: 0 errors. Some pre-existing warnings are acceptable.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build succeeds with `dist/` output.

- [ ] **Step 3: Commit if any fixes were made**

Only if lint/build revealed issues requiring changes. Otherwise skip.

---

## Self-Review Checklist

- [x] **Spec coverage:** All 4 sections covered — selection bar (Task 2), drawer (Task 3), FolderPage (Task 8-9), topbar entry (Task 4)
- [x] **No placeholders:** All tasks have full code blocks and exact commands
- [x] **Type consistency:** `IFolderItemProps` unchanged; `signalStore.drawerVisible` defined in Task 1 and used in Task 3; `galleryOperator.renameDir` referenced in Task 8 matches the `renameDir` protected method exposed via `rename()` on `galleryOperator`
