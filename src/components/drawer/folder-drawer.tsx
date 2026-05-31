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
      <div class="fixed inset-0 z-modal bg-transparent" onClick={handleClose} />
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
            <p class="text-center text-sm text-stone-300 py-8">暂无文件夹</p>
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
