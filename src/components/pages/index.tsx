import {
  Component,
  For,
  createEffect,
  createSignal,
  onCleanup,
} from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { Mode, NormalImage } from '../../types/global';
import { PackItem } from '../image-components/index-item';
import { createStore } from 'solid-js/store';
import { useParams, useSearchParams } from '@solidjs/router';
import { itemsOfEachPage } from '../../types/constant';
import signalStore from '../../utils/shared-signal';
import { FileDrop } from '../file-drop';
import { FolderDialog } from '../dialog/folder-dialog';
import { IFolderItemProps } from '../folder-list';
import { PageToolbar } from '../page-toolbar';

const path = window.require('path');

const getTitle = (mode: Mode, search?: string) => {
  let title = '';
  switch (mode) {
    case Mode.Normal:
      title = '首页';
      break;
    case Mode.Star:
      title = '收藏';
      break;
    default:
      title = '首页';
  }
  if (search) {
    return `${search} in ${title}`;
  }
  return title;
};

const getCoverPath = (img: NormalImage) => {
  return img.path ? `${img.path}/thumb.jpg` : img.cover;
};

let timer: NodeJS.Timeout;
export const IndexPage: Component = () => {
  let colRef = null as unknown as HTMLDivElement;
  const [packList, setPackList] = createSignal([] as unknown as NormalImage[]);
  const [searchParams] = useSearchParams();
  const [selectAll, setSelectAll] = createSignal(false);
  const lastDir = sessionStorage.getItem('lastSelectDir');

  const [currentDir, setCurrentDir] = createStore<IFolderItemProps>(
    JSON.parse(lastDir || '{}') || {
      id: -1,
      title: '',
      count: 0,
    },
  );
  const store = signalStore;
  const params = useParams();
  createEffect(async () => {
    store.refresh();
    setPackList([]);
    colRef?.scrollTo(0, 0);
    const mode = params.mode as Mode;
    store.title.set(getTitle(mode, searchParams.search));
    const [packList, total] = await galleryOperator.getPacks(
      +(searchParams.page || 1),
      mode,
      { search: searchParams.search || '' },
    );
    clearTimeout(timer);
    timer = setTimeout(() => {
      setPackList([...packList]);
    }, 300);
    store.page.set(Math.ceil(total / itemsOfEachPage));
  });

  createEffect(() => {
    const handleSelectAll = (e: KeyboardEvent) => {
      const isManaging = signalStore.isManaging();
      if (!isManaging) {
        return;
      }
      if (e.ctrlKey && e.key === 'a') {
        setSelectAll(!selectAll());
      }
    };
    document.addEventListener('keydown', handleSelectAll);
    onCleanup(() => {
      document.removeEventListener('keydown', handleSelectAll);
    });
  });

  createEffect(() => {
    store.refresh();
    store.selectedPacks.set([]);
    setSelectAll(false);
  });

  return (
    <div
      class="page"
      ref={colRef}
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
      {/* <Icon
        icon={MultiSelected}
        size={24}
        class="absolute left-6 top-6  cursor-pointer"
        classList={{
          'fill-sky-400': isManaging(),
          'hover:fill-slate-500': !isManaging(),
          'fill-slate-400': !isManaging(),
        }}
        onClick={() => {
          setIsManaging(!isManaging());
          store.selectedPacks.set([]);
        }}
      /> */}
      <FolderDialog />
      <FileDrop />
      <div class="overflow-auto flex-1 flex justify-center items-center flex-wrap h-full gap-7 py-4">
        <PageToolbar selectedDir={currentDir} />

        <For each={packList()}>
          {(e, index) => {
            return (
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
            );
          }}
        </For>
      </div>
    </div>
  );
};
