import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';

export const SelectionBar: Component = () => {
  return (
    <Show when={signalStore.isManaging()}>
      <div class="w-full shrink-0 flex items-center justify-between px-6 h-11 bg-white border-b border-stone-200 animate-slide-up">
        <span class="text-sm text-stone-500 tabular-nums">
          已选 {signalStore.selectedPacks().length} 个
        </span>
        <div class="flex items-center gap-2">
          <button
            aria-label="Select all"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }),
              );
            }}
            class="h-8 px-3 rounded-lg text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            全选 / 取消
          </button>
          <button
            aria-label="Move to folder"
            onClick={() => {
              signalStore.drawerVisible.set(true);
            }}
            disabled={!signalStore.selectedPacks().length}
            class="h-8 px-3 rounded-lg text-sm font-medium text-white bg-accent-violet hover:bg-violet-600 transition-colors disabled:opacity-40"
          >
            移动到文件夹
          </button>
        </div>
      </div>
    </Show>
  );
};
