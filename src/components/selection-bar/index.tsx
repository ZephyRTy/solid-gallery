import { Component, Show } from 'solid-js';
import signalStore from '../../utils/shared-signal';

export const SelectionBar: Component = () => {
  return (
    <Show when={signalStore.isManaging()}>
      <div class="w-full shrink-0 flex items-center justify-between px-6 h-11 mb-4 rounded-xl bg-primary-container/10 border border-primary/10 animate-slide-up">
        <span class="font-body-md text-sm text-on-surface-variant tabular-nums">
          Selected {signalStore.selectedPacks().length}
        </span>
        <div class="flex items-center gap-2">
          <button
            aria-label="Select all"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent('keydown', { ctrlKey: true, key: 'a' }),
              );
            }}
            class="h-8 px-3 rounded-lg text-sm text-on-surface-variant/70 hover:text-on-surface hover:bg-white/5 transition-colors font-body-md"
          >
            Select All / Deselect
          </button>
          <button
            aria-label="Move to folder"
            onClick={() => {
              signalStore.drawerVisible.set(true);
            }}
            disabled={!signalStore.selectedPacks().length}
            class="h-8 px-4 rounded-full text-sm font-semibold text-on-primary bg-primary hover:brightness-110 transition-all disabled:opacity-40 font-body-md"
          >
            Move to Folder
          </button>
        </div>
      </div>
    </Show>
  );
};
