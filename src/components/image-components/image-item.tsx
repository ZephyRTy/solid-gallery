import { Component, Setter } from 'solid-js';
import { setImageItemContextMenuPosition } from '../../utils/shared-signal';
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
      class="group relative aspect-square rounded-xl overflow-hidden bg-surface-container-high cursor-pointer
        animate-fade-in focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      role="button"
      tabIndex={0}
      aria-label={`Image ${props.index + 1}`}
      onKeyDown={(e) => e.key === 'Enter' && props.setZoom(props.index)}
      onClick={() => props.setZoom(props.index)}
      onContextMenu={(e) => {
        e.preventDefault();
        const parentRect =
          e.currentTarget.parentElement!.getBoundingClientRect();
        const relativeX = e.clientX - parentRect.left;
        const relativeY =
          e.clientY + e.currentTarget.parentElement!.scrollTop - parentRect.top;
        setImageItemContextMenuPosition(
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
      <img
        src={props.src}
        alt={`Image ${props.index + 1}`}
        class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
      />
      <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-background/60 text-on-surface-variant text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-label-sm">
        {props.index + 1}
      </div>
    </div>
  );
};
