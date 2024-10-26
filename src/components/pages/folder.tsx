import { Component, For, createEffect, onMount } from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { DirMap, Mode, NormalImage } from '../../types/global';
import { PackItem } from '../image-components/pack-item';
import { createStore } from 'solid-js/store';
import { useSearchParams } from '@solidjs/router';
import { itemsOfEachPage } from '../../types/constant';
import { FolderList, IFolderItemProps } from '../folder-list';
import signalStore from '../../utils/shared-signal';

let timer: NodeJS.Timeout;
export const FolderPage: Component = () => {
  let colRef = null as unknown as HTMLDivElement;
  const [packList, setPackList] = createStore([] as unknown as NormalImage[]);
  const [, setDirMap] = createStore({} as DirMap);
  const [searchParams] = useSearchParams();
  const lastDir = sessionStorage.getItem('currentDir');

  const [currentDir, setCurrentDir] = createStore<IFolderItemProps>(
    JSON.parse(lastDir || '{}') || {
      id: -1,
      title: '',
      count: 0,
    },
  );

  createEffect(async () => {
    setPackList([]);
    colRef?.scrollTo(0, 0);
  });

  onMount(() => {
    setDirMap(galleryOperator.getDirMap());
  });

  createEffect(async () => {
    if (currentDir) {
      const search = searchParams.search;
      let title = currentDir.title;
      if (search) {
        title = `${search} in ${title}`;
      }
      signalStore.title.set(title);

      const [list, total] = await galleryOperator.getPacks(
        +(searchParams?.page || 1),
        Mode.DirContent,
        {
          dirId: currentDir.id,
          search,
        },
      );
      clearTimeout(timer);
      timer = setTimeout(() => {
        setPackList(list);
      }, 300);
      signalStore.page.set(Math.ceil(total / itemsOfEachPage));
    }
  });

  return (
    <div class="folder-page h-full p-0 pr-5" ref={colRef}>
      <FolderList currentDir={currentDir} setCurrentDir={setCurrentDir} />
      <div class="overflow-auto flex-1 flex flex-wrap h-full gap-7 py-5">
        <For each={packList}>
          {(e, index) => {
            return (
              <PackItem
                src={e.path + e.cover}
                info={e}
                onStar={() => {
                  galleryOperator.updateStared({ ...e });
                  setPackList(index(), 'stared', !e.stared);
                }}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
};
