import { initStore } from '../shair';

const signalStore = initStore({
  title: '',
  page: 1,
  fileDropVisible: false,
  refresh: false,
  selectedPacks: ['1'] as string[],
});

export default signalStore;
