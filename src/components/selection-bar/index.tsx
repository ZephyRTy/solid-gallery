import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';

export const SelectionBar: Component = () => {
  return (
    <div
      class="fixed bottom-0 inset-x-0 z-overlay transition-all duration-300"
      classList={{
        'h-14 bg-white border-t border-stone-200 shadow-xl':
          signalStore.isManaging(),
        'h-10 bg-white/80 backdrop-blur-sm': !signalStore.isManaging(),
      }}
    >
      <div class="h-full flex items-center justify-between px-6">
        {/* Left: count (only when managing) */}
        <Show when={signalStore.isManaging()} fallback={<span />}>
          <span class="text-sm text-stone-500 tabular-nums">
            已选 {signalStore.selectedPacks().length} 个
          </span>
        </Show>

        {/* Right: actions + toggle */}
        <div class="flex items-center gap-3 ml-auto">
          <Show when={signalStore.isManaging()}>
            <button
              aria-label="Select all"
              onClick={() => {
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
          </Show>

          {/* Pill toggle */}
          <button
            aria-label={signalStore.isManaging() ? '退出选择模式' : '选择模式'}
            onClick={() => signalStore.isManaging.set((v) => !v)}
            class="flex items-center gap-2 group"
          >
            <span class="text-xs text-stone-400 group-hover:text-stone-600 transition-colors select-none">
              选择
            </span>
            <span
              class="relative inline-flex w-9 h-5 rounded-full transition-colors duration-200"
              classList={{
                'bg-accent-violet': signalStore.isManaging(),
                'bg-stone-200': !signalStore.isManaging(),
              }}
            >
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                classList={{
                  'translate-x-[18px]': signalStore.isManaging(),
                  'translate-x-0.5': !signalStore.isManaging(),
                }}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
