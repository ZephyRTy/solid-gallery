import { SharedSignal } from './shared-signal';

export type SharedStateStore<T> = {
  [key in keyof T]: T[key] extends object
    ? VirtualStore<T[key]>
    : SharedSignal<T[key]>;
};

export type StoreGetter<T> = () => T;
export type StoreSetter<T> = (value: T) => void;

export type DataOperation<T> = {
  get: StoreGetter<T>;
  set: StoreSetter<T>;
};

export type VirtualStore<T> = {
  [P in keyof T]: VirtualStore<T[P]> & DataOperation<T[P]>;
};
