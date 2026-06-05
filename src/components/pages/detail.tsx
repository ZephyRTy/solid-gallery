import { useParams, useSearchParams } from '@solidjs/router';
import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  onMount,
} from 'solid-js';
import { galleryOperator } from '../../utils/data/galleryOperator';
import { createStore } from 'solid-js/store';
import { ImageItem } from '../image-components/image-item';
import { itemsOfEachPage } from '../../types/constant';
import { Zoom } from '../image-components/zoom';
import { NormalImage } from '../../types/global';
import signalStore from '../../utils/shared-signal';
import { getLegalUrl } from '../../utils/functions/functions';
import { PackPageContext } from '../context-menu/pack-page-context';
import { compressWithMultiThread } from '../../utils/functions/main-thread';
import { tinyImage } from '../../utils/tiny-image';

const fs = window.require('fs');

export const Pack: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = params.id;
  const [imageList, setImageList] = createSignal<
    { src: string; realPath: string }[]
  >([]);
  const [fileList, setFileList] = createSignal<string[]>([]);
  const [srcNum, setSrcNum] = createSignal(-1);
  const [packInfo, setPackInfo] = createStore({} as NormalImage);
  const [isLoading, setIsLoading] = createSignal(true);
  let pageEle: HTMLDivElement | undefined;

  onMount(() => {
    const pack = galleryOperator.getPackImages(id);
    signalStore.title.set(pack?.title || '');
    setPackInfo(pack || {});
    const packPath = pack?.path;
    if (!packPath || !fs.existsSync(packPath)) return;
    signalStore.detailPackInfo.set(pack || null);
    window.sessionStorage.setItem('currentDetailPage', JSON.stringify(pack));

    const images = fs
      .readdirSync(packPath)
      .filter((e: string) => {
        const f = e.toLowerCase();
        return (
          (f.endsWith('.jpg') ||
            f.endsWith('.png') ||
            f.endsWith('.jpeg') ||
            f.endsWith('.webp')) &&
          f !== 'thumb.jpg'
        );
      })
      .sort((a: string, b: string) => {
        const aNum = Number(a.match(/\d+/g)?.[0]) || 0;
        const bNum = Number(b.match(/\d+/g)?.[0]) || 0;
        return aNum - bNum;
      })
      .map((img) => `${packPath}/${img}`);
    setFileList(images);
  });

  createEffect(async () => {
    setIsLoading(true);
    setImageList([]);
    const packPath = packInfo?.path;
    const page = parseInt(searchParams.page || '1');
    if (packPath && fs.existsSync(packPath)) {
      signalStore.page.set(Math.ceil(fileList().length / itemsOfEachPage));
      const srcList = fileList().slice(
        (page - 1) * itemsOfEachPage,
        page * itemsOfEachPage,
      );
      const pivot = Math.min(srcList.length, 8);
      setImageList(
        srcList.slice(0, pivot).map((e) => ({
          src: getLegalUrl(e),
          realPath: getLegalUrl(e),
        })),
      );
      setIsLoading(false);

      if (pivot >= srcList.length) return;

      const batchSize = 4;
      for (let cur = pivot; cur < srcList.length; cur += batchSize) {
        const curList = srcList.slice(cur, cur + batchSize);
        await compressWithMultiThread(curList).then((res) => {
          const temp = res.map((e, i) => ({
            src: e,
            realPath: getLegalUrl(curList[i]),
          }));
          setImageList((prev) => [...prev, ...temp]);
        });
      }
      const release = new Array(8).fill(tinyImage);
      compressWithMultiThread(release);
    }
  });

  createEffect(() => {
    if (srcNum() === -1) return;
    const page = parseInt(searchParams.page || '1');
    const newPage = Math.ceil((srcNum() + 1) / itemsOfEachPage);
    if (page !== newPage) {
      setSearchParams({ page: newPage });
    }
  });

  const handleWheel = (e: WheelEvent) => {
    if (e.deltaY > 0 && srcNum() < fileList().length - 1) {
      setSrcNum(srcNum() + 1);
    } else if (e.deltaY < 0 && srcNum() > 0) {
      setSrcNum(srcNum() - 1);
    }
  };

  return (
    <div class="flex flex-col flex-1 min-h-0">
      <div class="mb-14 flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <h2 class="font-display-lg text-[42px] leading-tight text-on-surface mb-2">
            {packInfo.title}
          </h2>
          <p class="font-body-md text-on-surface-variant/60">
            {fileList().length} images
          </p>
        </div>
      </div>
      <div ref={pageEle} class="flex-1">
        <PackPageContext />
        <Show when={srcNum() > -1}>
          <Zoom
            src={fileList()[srcNum()]}
            setSrc={setSrcNum}
            handleWheel={handleWheel}
            total={fileList().length}
            current={srcNum()}
          />
        </Show>
        <Show when={isLoading()}>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map(() => (
              <div class="aspect-square rounded-xl skeleton" />
            ))}
          </div>
        </Show>
        <Show when={!isLoading() && imageList().length === 0}>
          <div class="flex flex-col items-center justify-center py-20 text-on-surface-variant/40">
            <p class="font-body-md text-lg">No images found</p>
          </div>
        </Show>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          <For each={imageList()}>
            {(e, index) => (
              <ImageItem
                packInfo={packInfo}
                src={e.src}
                realPath={e.realPath}
                setZoom={setSrcNum}
                index={
                  index() +
                  (parseInt(searchParams.page || '1') - 1) * itemsOfEachPage
                }
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
