import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';
import { galleryOperator } from '../../utils/data/galleryOperator';

export const PackPageContext: Component = () => {
  const position = signalStore.imageItemContextMenuPosition;
  return (
    <Show when={position.visible()}>
      <div
        role="menu"
        class="fixed z-modal flex flex-col overflow-hidden w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-1 animate-scale-in"
        style={{
          left: `${Math.min(position.x(), window.innerWidth - 200)}px`,
          top: `${Math.min(position.y(), window.innerHeight - 120)}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          position.visible.set(false);
        }}
      >
        <button
          role="menuitem"
          class="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          onClick={() => {
            const { id, path: imgPath } = position.imageInfo();
            const cover = '/' + imgPath.split('/').pop();
            galleryOperator.changePackCover(id.toString(), cover, imgPath);
            position.visible.set(false);
          }}
        >
          Set as cover
        </button>
        <button
          role="menuitem"
          class="w-full text-left px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
          onClick={() => {
            const { path: imgPath } = position.imageInfo();
            window.require('electron').clipboard.writeText(imgPath);
            position.visible.set(false);
          }}
        >
          Copy path
        </button>
      </div>
    </Show>
  );
};
