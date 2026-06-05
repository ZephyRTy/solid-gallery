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
        setDirMap(initialDir.filter((item) => fuzzyMatch(value, item.title)));
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
    setDirMap((d) => d.id === id, 'title', title);
    setInitialDir((d) => d.id === id, 'title', title);
    setRenamingId(-1);
    setRenameValue('');
  };

  const handleDelete = (item: IFolderItemProps) => {
    if (window.confirm(`Delete folder "${item.title}"?`)) {
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
    <div class="flex flex-col w-56 shrink-0 glass-sidebar overflow-auto" style={{
      "max-height": 'calc(100vh - 160px)'
    }}>
      <div class="h-10 flex items-center border-b border-outline-variant/10 px-3 gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0 text-on-surface-variant/40"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          placeholder="Search"
          class="bg-transparent flex-1 text-sm outline-none text-on-surface placeholder-on-surface-variant/30 min-w-0 font-body-md"
          onInput={handleSearch()}
        />
        <button
          aria-label="Create new folder"
          onClick={() => setAddingDir(true)}
          class="shrink-0 w-6 h-6 flex items-center justify-center rounded text-on-surface-variant/40 hover:text-primary hover:bg-white/5 transition-colors"
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

      <Show when={addingDir()}>
        <div class="flex items-center gap-1 px-3 py-2 border-b border-outline-variant/10">
          <input
            ref={addInputRef}
            placeholder="Folder name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddDir();
              if (e.key === 'Escape') setAddingDir(false);
            }}
            class="flex-1 h-8 px-2 rounded border border-primary/40 bg-surface-container-high text-on-surface outline-none text-xs font-body-md"
            autofocus
          />
          <button
            onClick={handleAddDir}
            class="text-xs text-primary font-medium hover:brightness-110 px-1 font-body-md"
          >
            Add
          </button>
          <button
            onClick={() => setAddingDir(false)}
            class="text-xs text-on-surface-variant/40 hover:text-on-surface-variant/70 px-1 font-body-md"
          >
            Cancel
          </button>
        </div>
      </Show>

      <div class="flex-1 overflow-y-auto">
        <For each={dirMap}>
          {(item) => (
            <div
              class="group flex items-center gap-3 px-4 h-11 cursor-pointer transition-all duration-200 hover:bg-white/[0.03] text-sm"
              data-current={item.id === _props.currentDir.id ? 'true' : 'false'}
              classList={{
                'sidebar-active': item.id === _props.currentDir.id,
                'text-on-surface-variant/70': item.id !== _props.currentDir.id,
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

              <Show
                when={renamingId() === item.id}
                fallback={
                  <span class="flex-1 truncate font-body-md">{item.title}</span>
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
                  class="flex-1 bg-surface-container-high border border-primary/40 rounded px-1 text-xs outline-none min-w-0 text-on-surface"
                  autofocus
                />
              </Show>

              <button
                aria-label="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, item);
                }}
                class="shrink-0 w-5 h-5 hidden group-hover:flex items-center justify-center rounded text-on-surface-variant/30 hover:text-on-surface-variant/70 hover:bg-white/5 transition-colors"
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

              <span class="font-label-sm text-xs text-on-surface-variant/40 tabular-nums shrink-0">
                {item.count}
              </span>
            </div>
          )}
        </For>
      </div>

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
          <div class="w-36 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-xl py-1 animate-scale-in">
            <button
              class="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-white/5 transition-colors font-body-md"
              onClick={(e) => {
                e.stopPropagation();
                const item = contextMenu().item!;
                setRenamingId(item.id);
                setRenameValue(item.title);
                closeContextMenu();
                setTimeout(() => renameInputRef?.focus(), 50);
              }}
            >
              Rename
            </button>
            <button
              class="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors font-body-md"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(contextMenu().item!);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Show>

      <Show when={contextMenu().item !== null}>
        <div class="fixed inset-0 z-[1999]" onClick={closeContextMenu} />
      </Show>
    </div>
  );
};
