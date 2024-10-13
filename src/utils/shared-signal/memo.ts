import { StoreGetter, StoreSetter } from './type';

export class Memo<T> {
  private getterFn: StoreGetter<T>;
  private setterFn: StoreSetter<T>;
  private getPath: string[] = [];
  private setPath: string[] = [];

  constructor() {
    this.getterFn = (() => {}) as StoreGetter<T>;
    this.setterFn = (() => {}) as StoreSetter<T>;
  }

  getter(fn: StoreGetter<T>, path: string[]) {
    if (path.join('.') === this.getPath.join('.')) {
      return this.getterFn;
    }
    this.getPath = path;
    this.getterFn = fn;
    return this.getterFn;
  }

  setter(fn: StoreSetter<T>, path: string[]) {
    if (path.join('.') === this.setPath.join('.')) {
      return this.setterFn;
    }
    this.setPath = path;
    this.setterFn = fn;
    return this.setterFn;
  }
}
