import { Component, createSignal, Show } from 'solid-js';
import { SearchBar } from '../search-bar';
import signalStore from '../../utils/shared-signal';
const { ipcRenderer } = window.require('electron');

export const TopBar: Component<{
  isPackPage: boolean;
  headerScrolled: boolean;
}> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  return (
    <header
      class="fixed top-bar top-0 right-0 left-[280px] h-[80px] flex items-center justify-between px-10 z-40 transition-all duration-300"
      classList={{
        'glass-topbar': props.headerScrolled,
        'bg-transparent': !props.headerScrolled,
      }}
      onClick={(e) => {
        console.log('TopBar clicked, isPackPage:', props.isPackPage);
      }}
    >
      <div class="flex items-center gap-6">
        <Show when={!props.isPackPage}>
          <SearchBar />
        </Show>
        <h1
          class="no-drag font-display-lg text-2xl text-on-surface tracking-tight select-none"
          onDblClick={() => ipcRenderer.send('max')}
        >
          {signalStore.title()}
        </h1>
      </div>

      <div class="no-drag flex items-center gap-4">
        <Show when={!props.isPackPage}>
          <button
            aria-label={signalStore.isManaging() ? '退出选择模式' : '选择模式'}
            onClick={() => signalStore.isManaging.set((v) => !v)}
            class="flex items-center gap-2 h-9 px-3 rounded-full transition-all duration-200 hover:bg-white/5 group"
            title="选择模式"
          >
            <span class="font-body-md text-xs text-on-surface-variant/60 group-hover:text-on-surface transition-colors select-none">
              Select
            </span>
            <span
              class="relative inline-flex w-9 h-5 rounded-full transition-colors duration-200"
              classList={{
                'bg-primary': signalStore.isManaging(),
                'bg-surface-container-highest': !signalStore.isManaging(),
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

        <div class="h-5 w-[1px] bg-outline-variant/20 mx-1" />

        <button
          aria-label="Minimize"
          onClick={() => ipcRenderer.send('min')}
          class="w-3 h-3 rounded-full bg-amber-400 ring-1 ring-black/10 hover:scale-110 transition-all duration-200 btn-press focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          aria-label="Maximize"
          onClick={() => ipcRenderer.send('max')}
          class="w-3 h-3 rounded-full bg-emerald-400 ring-1 ring-black/10 hover:scale-110 transition-all duration-200 btn-press focus-visible:ring-2 focus-visible:ring-primary"
        />
        <button
          aria-label="Close"
          onClick={() => ipcRenderer.send('close')}
          class="w-3 h-3 rounded-full bg-accent-rose ring-1 ring-black/10 hover:scale-110 transition-all duration-200 btn-press focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
    </header>
  );
};
