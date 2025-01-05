import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { DirectoryInfo } from '../../types/global';
import './index.less';
import signalStore from '../../utils/shared-signal';
import { Checkbox } from '../checkbox/checkbox';
import { Icon } from '../icon';
import Add from '../../icon/add.svg';
import { debounce } from '../../utils/functions/functions';
import { fuzzyMatch } from '../../utils/functions/fuzzy-match';

export const FolderDialog: Component = () => {
  const [dirMap, setDirMap] = createSignal<[string, DirectoryInfo][]>([]);
  const [selectedDir, setSelectedDir] = createSignal('');
  const [addingDir, setAddingDir] = createSignal(false);
  const [isDuplicate, setIsDuplicate] = createSignal(false);
  const [searchText, setSearchText] = createSignal('');
  let inputRef = null as any as HTMLInputElement;
  const handleKeyDown = createMemo(() => (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (addingDir()) {
        const arr = Array.from(dirMap());
        const item = arr.find(([, value]) => {
          return value.title === inputRef.value;
        });
        if (item) {
          const ele = document.querySelector(
            `[data-folder-id="folder-dialog-${item[0]}"]`,
          );
          setSelectedDir(item[0]);
          ele?.scrollIntoView({ block: 'center' });
          setIsDuplicate(true);
          return;
        }
        galleryOperator
          .addNewDir(inputRef.value)
          .then((id) => {
            setAddingDir(false);
            setDirMap(Array.from(galleryOperator.getDirMap()));
            setSelectedDir(id.toString());
            setTimeout(() => {
              const selectedElement = document.querySelector('.item-selected');
              selectedElement?.scrollIntoView({ block: 'center' });
            }, 50);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }
  });

  const handleSearch = createMemo(() =>
    debounce((e: Event) => {
      setSearchText((e.target as HTMLInputElement).value);
      const arr = Array.from(dirMap());
      if (searchText()) {
        setDirMap(
          arr.filter(([, value]) => {
            return fuzzyMatch(searchText(), value.title);
          }),
        );
      } else {
        setDirMap(Array.from(galleryOperator.getDirMap()));
      }
    }, 200),
  );
  createEffect(() => {
    if (signalStore.folderDialogVisible()) {
      setAddingDir(false);
      setIsDuplicate(false);
      setDirMap(Array.from(galleryOperator.getDirMap()));

      setTimeout(() => {
        const selectedElement = document.querySelector('.item-selected');
        selectedElement?.scrollIntoView({ block: 'center' });
      }, 50);
    }
  });

  createEffect(() => {
    if (addingDir()) {
      setIsDuplicate(false);
      inputRef.focus();
    }
  });

  createEffect(() => {
    if (selectedDir().length) {
      const selectedElement = document.querySelector('.item-selected');
      if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect();
        const isVisible =
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <=
            (window.innerWidth || document.documentElement.clientWidth);

        if (!isVisible) {
          selectedElement.scrollIntoView({ block: 'center' });
        }
      }
    }
  });

  onMount(() => {
    setAddingDir(false);
    window.addEventListener('keydown', handleKeyDown());
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown());
    });
  });
  return (
    <div
      class="dialog-cover"
      classList={{
        'visible': signalStore.folderDialogVisible(),
      }}
    >
      <div class="folder-dialog w-110 bg-slate-100 flex flex-col rounded-md overflow-hidden">
        {/* <div class="w-full h-12 p-2 flex justify-center items-center border-slate-200 border-b-1">
          <Icon icon={Search} size={24} class="mr-2" />
          <input
            ref={inputRef}
            class={`outline-none flex-1 bg-transparent  underline ${isDuplicate() ? 'text-red-500' : 'text-sky-400'}`}
            onChange={() => {
              setIsDuplicate(false);
            }}
          />
        </div> */}
        <div class="overflow-y-auto scrollbar flex-1">
          <ul>
            {dirMap()
              .sort((a, b) =>
                a[1].title.localeCompare(b[1].title, 'zh-Hans-CN', {
                  sensitivity: 'accent',
                }),
              )
              .map(([key, value]) => {
                return (
                  <li
                    data-folder-id={`folder-dialog-${key}`}
                    class="font-medium cursor-pointer flex items-center justify-between px-5 h-14 border-slate-200 border-b-1 hover:text-sky-400"
                    classList={{
                      'item-selected text-sky-400': selectedDir() === key,
                    }}
                    onClick={() => {
                      if (selectedDir() === key) {
                        setSelectedDir('');
                        return;
                      }
                      setSelectedDir(key);
                    }}
                  >
                    <span>{value.title}</span>
                    <Checkbox
                      class="pointer-events-none"
                      checked={selectedDir() === key}
                      handleChanged={(e) => {
                        if (e) {
                          setSelectedDir(key);
                        }
                      }}
                    />
                  </li>
                );
              })}
          </ul>
        </div>
        <div
          class="border-slate-200 border-t-1 h-10 w-full flex items-center justify-center cursor-pointer fill-slate-400 hover:fill-sky-500"
          onClick={() => {
            setAddingDir(true);
          }}
        >
          <Show when={addingDir()} fallback={<Icon icon={Add} size={24} />}>
            <input
              ref={inputRef}
              class={`outline-none h-full w-full p-4 bg-transparent underline ${isDuplicate() ? 'text-red-500' : 'text-sky-400'}`}
              onChange={() => {
                setIsDuplicate(false);
              }}
              onInput={(e) => {
                handleSearch()(e);
              }}
            />
          </Show>
        </div>
        <div class="flex items-center justify-center h-14">
          <button
            class="h-full bg-slate-200 flex-1"
            onClick={() => {
              signalStore.folderDialogVisible.set(false);
            }}
          >
            取消
          </button>
          <button
            class="h-full bg-sky-300 flex-1"
            onClick={() => {
              galleryOperator
                .addFileToDir(+selectedDir(), signalStore.selectedPacks())
                .then(() => {
                  signalStore.folderDialogVisible.set(false);
                  signalStore.selectedPacks.set([]);
                  signalStore.refresh.set((v) => !v);
                });
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};
