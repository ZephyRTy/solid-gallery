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
    signalStore.refresh();
    if (!currentDir.id || currentDir.id < 0) return;
    setIsLoading(true);
    setPackList([]);
    const search = searchParams.search || '';
    const title = search
      ? `${search} in ${currentDir.title}`
      : currentDir.title;
    signalStore.title.set(title);

    const [list, total] = await galleryOperator.getPacks(
      +(searchParams.page || 1),
      Mode.DirContent,
      {
        dirId: currentDir.id,
        search,
      },
    );
    setPackList(list);
    setIsLoading(false);
    signalStore.page.set(Math.ceil(total / itemsOfEachPage));
  });

  return (
    <div class="flex flex-1 h-full min-h-0">
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
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {Array.from({ length: 6 }).map(() => (
              <div class="aspect-[4/3] rounded-xl skeleton" />
            ))}
          </div>
        </Show>
        <Show when={!isLoading() && packList.length === 0}>
          <div class="flex flex-col items-center justify-center py-20 text-on-surface-variant/40">
            <p class="font-body-md text-lg">Folder is empty</p>
          </div>
        </Show>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
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
