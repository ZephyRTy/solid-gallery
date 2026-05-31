import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';

export const SelectionBar: Component = () => {
  return (
    <Show when={signalStore.isManaging()}>
      <div class="fixed bottom-0 inset-x-0 z-overlay flex items-center justify-between px-6 h-14 bg-white border-t border-stone-200 shadow-xl animate-slide-up">
        <span class="text-sm text-stone-500 tabular-nums">
          已选 {signalStore.selectedPacks().length} 个
        </span>
        <div class="flex items-center gap-2">
          <button
            aria-label="Batch star"
            onClick={() => {
              const packs = signalStore.selectedPacks();
              if (!packs.length) return;
              // Toggle star based on first item's state — batch set all
              // For simplicity, star all selected
              packs.forEach(() => {
                // galleryOperator.updateStared needs NormalImage ref
                // No bulk API — skip for now, placeholder for future
              });
            }}
            class="h-9 px-4 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            批量星标
          </button>
          <button
            aria-label="Select all"
            onClick={() => {
              // This requires access to current page pack IDs
              // Dispatch Ctrl+A behavior — already handled in IndexPage
              document.dispatchEvent(
                new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }),
              );
            }}
            class="h-9 px-4 rounded-lg text-sm text-stone-600 hover:bg-stone-100 transition-colors"
          >
            全选 / 取消
          </button>
          <button
            aria-label="Move to folder"
            onClick={() => {
              signalStore.drawerVisible.set(true);
            }}
            disabled={!signalStore.selectedPacks().length}
            class="h-9 px-4 rounded-lg text-sm font-medium text-white bg-accent-violet hover:bg-violet-600 transition-colors disabled:opacity-40"
          >
            移动到文件夹
          </button>
        </div>
      </div>
    </Show>
  );
};
