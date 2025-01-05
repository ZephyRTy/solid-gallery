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
const path = window.require('path');

export const Pack: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = params.id;
  const [imageList, setImageList] = createSignal(
    [] as { src: string; realPath: string }[],
  );
  const [fileList, setFileList] = createSignal([] as string[]);
  const [srcNum, setSrcNum] = createSignal(-1);
  const [packInfo, setPackInfo] = createStore({} as NormalImage);
  const [style, setStyle] = createSignal('' as string);
  let pageEle: HTMLDivElement | undefined;

  onMount(() => {
    window.addEventListener('resize', () => {
      setStyle(`top: ${pageEle?.scrollTop}px;`);
    });
    let pack: NormalImage | undefined;
    if (!packInfo.id) {
      pack = galleryOperator.getPackImages(id);
      signalStore.title.set(pack?.title || '');
      setPackInfo(pack || {});
    }
    const packPath = pack?.path;

    if (!fs.existsSync(packPath)) {
      return;
    }
    window.sessionStorage.setItem('currentDetailPage', JSON.stringify(pack));
    if (fileList().length === 0) {
      const imagePathList = fs
        .readdirSync(packPath)
        .filter((e: string) => {
          const filename = e.toLowerCase();
          return (
            (filename.endsWith('.jpg') ||
              filename.endsWith('.png') ||
              filename.endsWith('.jpeg') ||
              filename.endsWith('.webp')) &&
            e.toLowerCase() !== 'thumb.jpg'
          );
        })
        .map((image, index) => {
          return `${packPath}/${image}`;
        }) as string[];
      setFileList(imagePathList);
    }
  });

  createEffect(async () => {
    setImageList([]);
    const packPath = packInfo?.path;
    const page = parseInt(searchParams.page || '1');
    if (fs.existsSync(packPath)) {
      signalStore.page.set(Math.ceil(fileList().length / itemsOfEachPage));
      const srcList = fileList().slice(
        (page - 1) * itemsOfEachPage,
        page * itemsOfEachPage,
      );
      const pivot = Math.min(srcList.length, 8);
      setImageList([
        ...srcList.slice(0, pivot).map((e) => ({
          src: getLegalUrl(e),
          realPath: getLegalUrl(e),
        })),
      ]);
      if (pivot >= srcList.length) {
        return;
      }

      const batchSize = 4;
      for (let cur = pivot; cur < srcList.length; cur += batchSize) {
        const curList = srcList.slice(cur, cur + batchSize);
        await compressWithMultiThread(curList).then((res) => {
          const temp = res.map((e, i) => ({
            src: e,
            realPath: getLegalUrl(curList[i]),
          }));
          setImageList((prev) => {
            return [...prev, ...temp];
          });
        });
      }
      const release = new Array(8).fill(tinyImage);
      compressWithMultiThread(release);

      // const temp = srcList.slice(pivot);
      // compressWasm(temp).then((res) => {
      //   setImageList((prev) => {
      //     return [
      //       ...prev,
      //       ...res.map((e, i) => ({ src: e, realPath: temp[i] })),
      //     ];
      //   });
      // });
    }
  });

  createEffect(() => {
    if (srcNum() === -1) {
      return;
    }
    setStyle(`top: ${pageEle?.scrollTop}px;`);
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
    <>
      <div class="pack-page" ref={pageEle}>
        <PackPageContext />
        <Show when={srcNum() > -1}>
          <Zoom
            src={fileList()[srcNum()]}
            setSrc={setSrcNum}
            handleWheel={handleWheel}
            style={style()}
          />
        </Show>
        <For each={imageList()}>
          {(e, index) => {
            return (
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
            );
          }}
        </For>
      </div>
    </>
  );
};
