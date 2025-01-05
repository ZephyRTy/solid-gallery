import { createSignal } from 'solid-js';
import {
  BasicBookmark,
  BasicData,
  BasicFolder,
  InsertResult,
} from '../../types/global';
import signalStore from '../../utils/shared-signal';
import { galleryOperator } from '../../utils/data/galleryOperator';
import './index.less';
import { Toast } from '../toast';
// eslint-disable-next-line no-unused-vars
export const FileDrop = <
  A extends BasicData,
  B extends BasicBookmark,
  C extends BasicFolder,
>() => {
  const [result, setResult] = createSignal<InsertResult[]>([]);
  let root = null as unknown as HTMLDivElement;
  return (
    <div
      ref={root}
      class={'file-drop-cover rounded-md'}
      classList={{ 'visible': signalStore.fileDropVisible() }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const relatedTarget = e.srcElement as HTMLElement;
        const target = e.target as HTMLElement;
        if (relatedTarget === target && relatedTarget === root) {
          signalStore.fileDropVisible.set(false);
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        signalStore.fileDropVisible.set(false);

        if (!e.dataTransfer) {
          return;
        }
        const operator = galleryOperator;
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          operator
            .addNewPack(
              files.map((e) => {
                return {
                  title: e.name,
                  path: (e as any).path || e.name,
                };
              }),
              false,
            )
            .then((res) => {
              if (Array.isArray(res)) {
                const success = res.filter((e) => e.type === '成功');
                if (success.length > 0) {
                  Toast.show({
                    message: `${success.length} 个图包添加成功`,
                    type: 'success',
                  });
                }
                res.forEach((e) => {
                  if (e.type !== '成功') {
                    Toast.show({
                      message: `${e.title} ${e.type}`,
                      type: 'error',
                    });
                  }
                });
                if (success.length > 0) {
                  signalStore.refresh.set((v) => !v);
                }
              }
            });
        }
      }}
    ></div>
  );
};
