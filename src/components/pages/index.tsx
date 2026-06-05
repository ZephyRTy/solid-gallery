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
      title = 'My Library';
      break;
    case Mode.Star:
      title = 'Starred';
      break;
    default:
      title = 'My Library';
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
    store.refresh();
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
      if (e.key === 'Escape') {
        signalStore.isManaging.set(false);
        return;
      }
      if (!signalStore.isManaging()) return;
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
      class="flex-1 flex flex-col min-h-0"
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

      <div class="mb-14 flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <h3 class="font-display-lg text-[42px] leading-tight text-on-surface mb-2">
            {signalStore.title()}
          </h3>
          <p class="font-body-md text-on-surface-variant/60 max-w-md">
            The curated repository of your professional digital captures and
            high-fidelity assets.
          </p>
        </div>
      </div>

      <div ref={scrollRef} class="flex-1 overflow-auto">
        <Show when={isLoading()}>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map(() => (
              <div class="aspect-[4/3] rounded-xl skeleton" />
            ))}
          </div>
        </Show>

        <Show when={!isLoading() && packList().length === 0}>
          <div class="flex flex-col items-center justify-center py-20 text-on-surface-variant/40">
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
            <p class="mt-4 font-body-md text-lg">
              {search()
                ? `No results for "${search()}"`
                : 'No packs yet. Drag & drop a folder to get started.'}
            </p>
          </div>
        </Show>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
