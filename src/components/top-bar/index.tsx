import { Component, Show } from 'solid-js';
import { SearchBar } from '../search-bar';
import signalStore from '../../utils/shared-signal';
const { ipcRenderer } = window.require('electron');

export const TopBar: Component<{ isPackPage: boolean }> = (props) => {
  return (
    <div class="relative top-bar h-10 shrink-0 flex items-center px-6">
      <Show when={!props.isPackPage}>
        <SearchBar />
      </Show>
      <h1 class="flex-1 text-center text-sm text-stone-400 tracking-wider select-none">
        {signalStore.title()}
      </h1>
      <div class="flex items-center gap-3 no-drag ml-auto">
        <Show when={!props.isPackPage}>
          <button
            aria-label={signalStore.isManaging() ? '退出选择模式' : '选择模式'}
            onClick={() => signalStore.isManaging.set((v) => !v)}
            class="flex items-center gap-2 group"
            title="选择模式"
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
        </Show>
        <button
          aria-label="Minimize"
          onClick={() => ipcRenderer.send('min')}
          class="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
        />
        <button
          aria-label="Maximize"
          onClick={() => ipcRenderer.send('max')}
          class="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
        />
        <button
          aria-label="Close"
          onClick={() => ipcRenderer.send('close')}
          class="w-3 h-3 rounded-full bg-accent-rose hover:bg-rose-600 transition-colors btn-press focus-visible:ring-2 focus-visible:ring-accent-violet"
        />
      </div>
    </div>
  );
};
