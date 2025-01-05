import { Component, createMemo, For, onMount, splitProps } from 'solid-js';
import { createStore } from 'solid-js/store';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { useSearchParams } from '@solidjs/router';
import { debounce } from '../../utils/functions/functions';
import FolderOpen from '../../icon/folder-open.svg';
import { Icon } from '../icon';
import './index.less';
import { fuzzyMatch } from '../../utils/functions/fuzzy-match';
interface IProps {
  currentDir: IFolderItemProps;
  default?: boolean;
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
  const [props] = splitProps(_props, [
    'currentDir',
    'setCurrentDir',
    'handleClick',
    'default',
  ]);
  const [initialDir, setInitialDir] = createStore<IFolderItemProps[]>([]);
  const [, setSearchParams] = useSearchParams();
  const getDirMap = createMemo(() => {
    const arr = Array.from(galleryOperator.getDirMap())
      .map(([key, value]) => {
        return {
          id: +key,
          title: value.title,
          count: value.count,
          updateTime: value.updateTime,
        };
      })
      .sort((a, b) => b.updateTime - a.updateTime);
    setDirMap(arr);
    setInitialDir(arr);
    if (props.currentDir.id >= 0) {
      props.setCurrentDir(props.currentDir);
      setTimeout(() => {
        document
          .querySelectorAll('.current-dir')[0]
          ?.scrollIntoView({ block: 'center' });
      }, 20);
    }
    return arr;
  });

  const handleSearch = createMemo(() => {
    return debounce((e) => {
      props.setCurrentDir({ id: -1, title: '', count: 0 });
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        setDirMap(initialDir.filter((item) => fuzzyMatch(value, item.title)));
      } else {
        setDirMap(initialDir);
        setTimeout(() => {
          document
            .querySelectorAll('.current-dir')[0]
            ?.scrollIntoView({ block: 'center' });
        }, 20);
      }
    }, 300);
  });

  onMount(() => {
    const arr = getDirMap();
    const lastDir = JSON.parse(sessionStorage.getItem('currentDir') || '{}');
    // if (props.default) {
    //   props.setCurrentDir(arr[0]);
    // }
    if (lastDir.id >= 0) {
      props.setCurrentDir(lastDir);
      return;
    }
    props.setCurrentDir(arr[0]);
  });

  // createEffect(() => {
  //   signalStore.refresh();
  //   const arr = getDirMap();
  //   const item = arr!.find((item) => item.id === props.currentDir.id);
  //   const index = dirMap.findIndex((item) => item.id === props.currentDir.id);
  //   setDirMap(index, { ...item });
  //   console.log('currentDir');
  // });

  return (
    <div class="folder-list-wrapper relative">
      <div class="h-8 w-full text-center border-b-1 border-slate-300">
        <input
          placeholder="搜索"
          class="bg-transparent w-full h-full p-2 focus:outline-none"
          onInput={handleSearch()}
        />
      </div>
      <div class="folder-list flex-1 overflow-y-auto">
        <For each={dirMap}>
          {(item) => (
            <div
              class="folder-list-item relative h-12 flex items-center justify-between border-b-1 border-slate-300 "
              classList={{
                'current-dir': item.id === props.currentDir.id,
                'hover:text-sky-400 cursor-pointer':
                  item.id !== props.currentDir.id,
              }}
              onClick={() => {
                props.setCurrentDir(item);
                props.handleClick?.(item);
              }}
            >
              <Icon
                icon={FolderOpen}
                size={20}
                style={{
                  top: '50%',
                  left: '5px',
                  transform: 'translateY(-50%)',
                }}
                className="absolute left-0 top-0 h-full flex-center fill-sky-400 transition-opacity duration-300"
                classList={{
                  'opacity-0': item.id !== props.currentDir.id,
                }}
              />
              <span>{item.title}</span>
              <span class="folder-count">{item.count}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
