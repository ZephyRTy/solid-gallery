/* eslint-disable @typescript-eslint/ban-types */
import { Accessor, createSignal, Setter } from 'solid-js';
export class SharedSignal<T> {
  private signal: Accessor<T>;
  private setSignal: Setter<T>;

  constructor(value: T) {
    const [signal, setSignal] = createSignal<T>(value);
    this.setSignal = setSignal;
    this.signal = signal;
  }

  get() {
    return this.signal();
  }

  set(value: Exclude<T, Function> | ((prev: T) => T)) {
    this.setSignal(value);
  }
}
