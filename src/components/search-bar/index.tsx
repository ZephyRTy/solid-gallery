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
    <div class="no-drag relative flex items-center group w-60">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="absolute left-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors shrink-0"
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
        class="w-full bg-surface-container-high/40 border border-white/5 rounded-full py-2 pl-12 pr-10 text-sm focus:ring-1 focus:ring-primary/40 focus:bg-surface-container-high/60 transition-all placeholder:text-on-surface-variant/30 text-on-surface outline-none"
      />
      {value() && (
        <button
          onClick={clear}
          class="absolute right-3 shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-on-surface-variant/30 hover:text-on-surface-variant/60 hover:bg-white/5 transition-colors"
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
