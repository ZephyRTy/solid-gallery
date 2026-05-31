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
      <div class="flex items-center gap-1 no-drag ml-auto">
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
