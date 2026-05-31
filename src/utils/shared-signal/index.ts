import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';

function signal<T>(initial: T) {
  const [get, set] = createSignal(initial);
  return Object.assign(() => get(), { set });
}

const [imageItemContextMenuPosition, setImageItemContextMenuPosition] =
  createStore({
    x: 0,
    y: 0,
    visible: false,
    imageInfo: { id: -1, path: '' },
  });

const signalStore = {
  title: signal(''),
  page: signal(1),
  fileDropVisible: signal(false),
  refresh: signal(false),
  selectedPacks: signal([] as number[]),
  isManaging: signal(false),
  folderDialogVisible: signal(false),
  drawerVisible: signal(false),
  detailPackInfo: signal(null as { title?: string; path?: string } | null),
  imageItemContextMenuPosition,
};

export { setImageItemContextMenuPosition };
export default signalStore;
