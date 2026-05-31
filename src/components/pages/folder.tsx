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
          setSearchParams({
            search: undefined,
            page: 1,
            dir: item.id.toString(),
          });
          sessionStorage.setItem('currentDir', JSON.stringify(item));
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
