import { Component, Show } from 'solid-js';
import cross from '../../icon/cross.svg';
import max from '../../icon/maximize.svg';
import min from '../../icon/minimize.svg';
import { Icon } from '../icon';
import { SearchBar } from '../search-bar';
import signalStore from '../../utils/shared-signal';
const { ipcRenderer } = window.require('electron');

export const TopBar: Component<{ showSearch: boolean }> = (props) => {
  const handleClose = () => {
    ipcRenderer.send('close');
  };
  const handleMax = () => {
    ipcRenderer.send('max');
  };
  const handleMin = () => {
    ipcRenderer.send('min');
  };

  return (
    <div class="h-16 flex-center relative top-bar z-[9999] bg-slate-100">
      <Show when={props.showSearch}>
        <SearchBar />
      </Show>
      <div class="title">{signalStore.title.get()}</div>
      <div class="absolute right-4 cursor-pointer no-drag flex-center gap-2">
        <Icon
          icon={min}
          size={24}
          class=" hover:fill-yellow-500"
          onClick={handleMin}
        />
        <Icon
          icon={max}
          size={24}
          class=" hover:fill-green-600"
          onClick={handleMax}
        />
        <Icon
          icon={cross}
          size={24}
          class=" hover:fill-red-600"
          onClick={handleClose}
        />
      </div>
    </div>
  );
};
