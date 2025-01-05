import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';
import './index.less';
import { galleryOperator } from '../../utils/data/galleryOperator';
interface IProps {
  x: number;
  y: number;
}
export const PackPageContext: Component = () => {
  const position = signalStore.imageItemContextMenuPosition;
  return (
    <Show when={position.visible()}>
      <div
        class="flex flex-col overflow-hidden absolute w-60 bg-white border border-slate-300 rounded-md"
        style={{
          left: `${position.x()}px`,
          top: `${position.y()}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          position.visible.set(false);
        }}
      >
        <div
          class="context-item"
          onClick={() => {
            const { id, path } = position.imageInfo();
            const cover = '/' + path.split('/').pop();
            galleryOperator.changePackCover(id.toString(), cover, path);
          }}
        >
          设为封面
        </div>
      </div>
    </Show>
  );
};
