import { SetStoreFunction } from 'solid-js/store';
import { SharedSignal } from './shared-signal';

type Signal<T> = (() => T) & SharedSignal<T>;
export type ObjectAsSignal<T> = T & { $$asSignal: true };

export type SharedStateStore<T> = {
  [key in keyof T]: T[key] extends ObjectAsSignal<infer U>
    ? Signal<U>
    : T[key] extends Array<infer U>
      ? VirtualArray<U>
      : T[key] extends object
        ? VirtualStore<T[key]> & StoreOperations<T[key]>
        : Signal<T[key]>;
};

export type StoreGetter<T> = () => T;
export type StoreSetter<T> = (value: T) => void;
export type StoreOperations<T> = {
  get: StoreGetter<T>;
  pureSet: SetStoreFunction<T>;
};

export type DataOperation<T> = {
  get: StoreGetter<T>;
  set: StoreSetter<T>;
  (): T;
};

export type VirtualArray<T> = {
  push: (value: T) => void;
  [index: number]: VirtualStore<T> & DataOperation<T>;
};

export type Callable<T> = () => T;

export type VirtualStore<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? VirtualArray<U>
    : T[P] extends object
      ? VirtualStore<T[P]> & DataOperation<T[P]>
      : Callable<T> & DataOperation<T[P]>;
};

type a = VirtualStore<number>;
