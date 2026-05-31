import { initStore } from '../shair';
import { asSignal } from '../shair/utils';

const signalStore = initStore({
  title: '',
  page: 1,
  fileDropVisible: false,
  refresh: false,
  detailPackInfo: asSignal(null as { title?: string; path?: string } | null),
  selectedPacks: asSignal([] as number[]),
  isManaging: false,
  folderDialogVisible: false,
  drawerVisible: false,
  imageItemContextMenuPosition: {
    x: 0,
    y: 0,
    visible: false,
    imageInfo: {
      id: -1,
      path: '',
    },
  },
});
export default signalStore;
