import { Component, For, createEffect } from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { Mode, NormalImage } from '../../types/global';
import { PackItem } from '../image-components/pack-item';
import { createStore } from 'solid-js/store';
import { useParams, useSearchParams } from '@solidjs/router';
import { itemsOfEachPage } from '../../types/constant';
import signalStore from '../../utils/shared-signal';
import { FileDrop } from '../file-drop';

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
  const [packList, setPackList] = createStore([] as unknown as NormalImage[]);
  const [searchParams] = useSearchParams();
  const store = signalStore;
  const params = useParams();
  createEffect(async () => {
    store.refresh.get();
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
      setPackList(packList);
    }, 300);
    store.page.set(Math.ceil(total / itemsOfEachPage));
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
      <FileDrop />
      <For each={packList}>
        {(e, index) => {
          return (
            <PackItem
              src={getCoverPath(e)}
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
  );
};
