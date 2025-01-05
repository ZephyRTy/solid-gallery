import { Component, Setter } from 'solid-js';
import signalStore from '../../utils/shared-signal';
import { produce } from 'solid-js/store';
import { NormalImage } from '../../types/global';

interface IProps {
  src: string;
  realPath: string;
  index: number;
  packInfo: NormalImage;
  setZoom: Setter<number>;
}

export const ImageItem: Component<IProps> = (props) => {
  return (
    <div
      class="
			flex flex-col items-center justify-center gap-2 pb-1 aspect-auto cursor-pointer"
      onClick={() => {
        props.setZoom(props.index);
      }}
      onContextMenu={(e) => {
        e.preventDefault(); // 禁用默认右键菜单

        const parentRect =
          e.currentTarget.parentElement!.getBoundingClientRect();
        const relativeX = e.clientX - parentRect.left;
        const relativeY =
          e.clientY + e.currentTarget.parentElement!.scrollTop - parentRect.top;

        signalStore.imageItemContextMenuPosition.pureSet(
          produce((draft) => {
            draft.x = relativeX;
            draft.y = relativeY;
            draft.visible = true;
            draft.imageInfo = {
              id: props.packInfo.id,
              path: props.realPath,
            };
          }),
        );
      }}
    >
      <div class="flex-center w-full rounded-md ">
        <img
          class="rounded-md shadow-md max-h-full transition-all duration-500 hover:shadow-lg hover:shadow-slate-600"
          src={props.src}
        />
      </div>
    </div>
  );
};
