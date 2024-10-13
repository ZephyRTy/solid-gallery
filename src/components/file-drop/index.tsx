import { createSignal } from 'solid-js';
import { BasicBookmark, BasicData, BasicFolder } from '../../types/global';
import signalStore from '../../utils/shared-signal';
import { galleryOperator } from '../../utils/data/galleryOperator';
// eslint-disable-next-line no-unused-vars
export const FileDrop = <
  A extends BasicData,
  B extends BasicBookmark,
  C extends BasicFolder,
>() => {
  const visible = signalStore.fileDropVisible.get();
  const [result, setResult] = createSignal<string[]>([]);
  let root = null as unknown as HTMLDivElement;
  return (
    <div
      ref={root}
      class={'file-drop-cover'}
      classList={{ 'visible': signalStore.fileDropVisible.get() }}
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
        console.log(files);
        if (files.length > 0) {
          operator
            .addNewPack(
              files.map((e) => {
                console.log(e);
                return {
                  title: e.name,
                  path: (e as any).path || e.name,
                };
              }),
              false,
            )
            .then((res) => {
              if (Array.isArray(res)) {
                setResult([...res]);
                signalStore.refresh.set((v) => !v);
              }
            });
        }
      }}
    >
      <div class={'file-drop pointer-events-none'}>
        <div class={'file-drop__content'}>
          <div class={'file-drop__span'}>
            {result().length > 0
              ? result().map((e, i) => {
                  let s = e.split(':::');
                  return (
                    <p class={'error-info'}>
                      <span class={'error-info--title'}>{s[0]}</span>
                      &nbsp;
                      <span
                        class={
                          'error-info__type--' +
                          (s[1] === '成功' ? 'success' : 'error')
                        }
                      >
                        {s[1]}
                      </span>
                    </p>
                  );
                })
              : 'Drop files here'}
          </div>
        </div>
      </div>
    </div>
  );
};
