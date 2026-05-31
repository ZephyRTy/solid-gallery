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
      {/* Select toggle + window controls */}
      <div class="flex items-center gap-3 no-drag ml-auto">
        <Show when={!props.isPackPage}>
          <button
            aria-label="Toggle select mode"
            onClick={() => signalStore.isManaging.set((v) => !v)}
            class="flex items-center justify-center w-6 h-6 rounded text-stone-300 hover:text-stone-600 transition-colors"
            classList={{
              'text-accent-violet': signalStore.isManaging(),
            }}
            title="选择模式"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
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
