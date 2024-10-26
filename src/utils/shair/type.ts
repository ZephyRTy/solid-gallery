import { SharedSignal } from './shared-signal';

export type SharedStateStore<T> = {
  [key in keyof T]: T[key] extends Array<infer U>
    ? VirtualArray<U>
    : T[key] extends object
      ? VirtualStore<T[key]> & StoreAccessor<T[key]>
      : SharedSignal<T[key]>;
};

export type StoreGetter<T> = () => T;
export type StoreSetter<T> = (value: T) => void;
export type StoreAccessor<T> = {
  get: StoreGetter<T>;
};

export type DataOperation<T> = {
  get: StoreGetter<T>;
  set: StoreSetter<T>;
};

export type VirtualArray<T> = {
  push: (value: T) => void;
  [index: number]: VirtualStore<T> & DataOperation<T>;
};

export type VirtualStore<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? VirtualArray<U>
    : VirtualStore<T[P]> & DataOperation<T[P]>;
};
