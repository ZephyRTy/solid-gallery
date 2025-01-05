import { Component, createSignal } from 'solid-js';
import { Icon } from '../icon';
import SearchIcon from '../../icon/search.svg';
import { useSearchParams } from '@solidjs/router';
import './index.less';
import signalStore from '../../utils/shared-signal';
const { ipcRenderer } = window.require('electron');

export const SearchBar: Component = () => {
  const [focus, setFocus] = createSignal(false);
  const [, setSearchParams] = useSearchParams();

  let input = undefined as HTMLInputElement | undefined;
  const handleClick = () => {
    if (input) {
      if (!focus()) {
        input.focus();
        document.addEventListener('keydown', bindEnter);
      } else {
        input.blur();
        input.value = '';
        document.removeEventListener('keydown', bindEnter);
      }
      setFocus((prev) => !prev);
    }
  };

  const bindEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      signalStore.selectedPacks.set([]);
      const value = input?.value;
      if (value === 'console' && e.ctrlKey) {
        ipcRenderer.send('console');
        return;
      }
      setSearchParams({ search: value });
      input!.value = '';
    }
  };
  return (
    <div
      class={`no-drag absolute left-4 flex-center p-2 border-2 rounded-full transition-all search-input ${
        focus()
          ? 'search-input-focus border-slate-800'
          : 'fill-slate-400 hover:fill-slate-500 border-transparent'
      }`}
    >
      <Icon
        icon={SearchIcon}
        size={24}
        onClick={handleClick}
        class={`cursor-pointer ${focus() ? 'scale-110' : 'hover:scale-110'}`}
      />
      <input ref={input} type="text" class="transition-all duration-200" />
    </div>
  );
};
