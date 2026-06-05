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
      <div class="fixed inset-0 z-modal bg-transparent" onClick={handleClose} />
      <div
        role="dialog"
        aria-label="Select folder"
        class="fixed right-0 top-0 bottom-0 z-modal w-80 glass-sidebar shadow-2xl flex flex-col animate-slide-in-right"
      >
        <div class="flex items-center justify-between px-5 h-14 border-b border-outline-variant/10">
          <span class="font-body-md text-sm font-semibold text-on-surface">
            Move to Folder
          </span>
          <button
            aria-label="Close drawer"
            onClick={handleClose}
            class="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant/40 hover:text-on-surface hover:bg-white/5 transition-colors"
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

        <div class="p-4 border-b border-outline-variant/10 flex items-center gap-2">
          <div class="flex-1 flex items-center h-10 px-3 rounded-lg bg-surface-container-high/40 focus-within:bg-surface-container-high/60 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="mr-2 shrink-0 text-on-surface-variant/40"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              placeholder="Filter folders..."
              value={searchText()}
              onInput={(e) => setSearchText(e.currentTarget.value)}
              class="flex-1 bg-transparent outline-none text-sm text-on-surface placeholder-on-surface-variant/30 font-body-md"
            />
          </div>
          <button
            aria-label="Create new folder"
            onClick={() => setAddingDir(true)}
            class="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant/40 hover:text-primary hover:bg-white/5 transition-colors btn-press"
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

        <Show when={addingDir()}>
          <div class="flex items-center gap-2 px-4 py-2 border-b border-outline-variant/10">
            <input
              ref={inputRef}
              placeholder="Folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddDir();
                if (e.key === 'Escape') setAddingDir(false);
              }}
              class="flex-1 h-10 px-3 rounded-lg border border-primary/40 bg-surface-container-high text-on-surface outline-none text-sm font-body-md"
              autofocus
            />
            <button
              onClick={handleAddDir}
              class="text-sm text-primary font-medium hover:brightness-110 px-2 font-body-md"
            >
              Add
            </button>
            <button
              onClick={() => setAddingDir(false)}
              class="text-sm text-on-surface-variant/40 hover:text-on-surface-variant/70 px-2 font-body-md"
            >
              Cancel
            </button>
          </div>
        </Show>

        <div class="flex-1 overflow-auto scrollbar-custom px-1 py-2">
          <Show
            when={filtered().length === 0}
            fallback={
              <ul class="space-y-0.5">
                <For each={filtered()}>
                  {(item) => (
                    <li>
                      <button
                        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 hover:bg-white/[0.03]"
                        classList={{
                          'bg-primary/10 text-primary':
                            selectedDir() === item.id,
                          'text-on-surface-variant/70':
                            selectedDir() !== item.id,
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
                        <span class="flex-1 truncate text-sm font-medium font-body-md">
                          {item.title}
                        </span>
                        <span class="font-label-sm text-xs text-on-surface-variant/40 tabular-nums">
                          {item.count}
                        </span>
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            }
          >
            <p class="text-center text-sm text-on-surface-variant/30 py-8 font-body-md">
              No folders yet
            </p>
          </Show>
        </div>

        <div class="flex border-t border-outline-variant/10">
          <button
            onClick={handleClose}
            class="flex-1 h-12 text-sm text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5 transition-colors font-body-md"
          >
            Cancel
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
            class="flex-1 h-12 text-sm font-semibold text-on-primary bg-primary hover:brightness-110 transition-all disabled:opacity-40 font-body-md"
            disabled={!selectedDir()}
          >
            Move Here
          </button>
        </div>
      </div>
    </Show>
  );
};
