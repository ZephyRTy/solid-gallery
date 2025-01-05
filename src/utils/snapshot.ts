import { NormalImage } from '../types/global';

export const snapshot = {
  value: [] as {
    img: HTMLImageElement;
    data: NormalImage;
  }[][],
  ready: false,
  load() {
    this.ready = false;
    const v = this.value;
    this.value = [];
    return v;
  },
  save(
    value: {
      img: HTMLImageElement;
      data: NormalImage;
    }[][],
  ) {
    this.ready = true;
    this.value = value;
  },
};
