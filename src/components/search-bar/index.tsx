import { Component, createSignal } from 'solid-js';
import { useSearchParams } from '@solidjs/router';
import signalStore from '../../utils/shared-signal';
const { ipcRenderer } = window.require('electron');

export const SearchBar: Component = () => {
  const [value, setValue] = createSignal('');
  const [, setSearchParams] = useSearchParams();
  let inputRef: HTMLInputElement | undefined;

  const submit = () => {
    signalStore.selectedPacks.set([]);
    const v = value();
    if (v === 'console') {
      ipcRenderer.send('console');
      return;
    }
    setSearchParams({ search: v || null });
  };

  const clear = () => {
    setValue('');
    setSearchParams({ search: null });
    inputRef?.focus();
  };

  return (
    <div class="no-drag flex items-center gap-2 h-8 px-3 rounded-full bg-stone-100 border border-stone-200 focus-within:bg-white focus-within:border-accent-violet focus-within:shadow-sm transition-all duration-200 w-56">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#a8a29e"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="shrink-0"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search packs..."
        value={value()}
        onInput={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') clear();
        }}
        class="flex-1 outline-none bg-transparent text-sm text-stone-700 placeholder-stone-300 min-w-0"
      />
      {value() && (
        <button
          onClick={clear}
          class="shrink-0 w-4 h-4 flex items-center justify-center rounded-full text-stone-300 hover:text-stone-500 hover:bg-stone-200 transition-colors"
          aria-label="Clear search"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
