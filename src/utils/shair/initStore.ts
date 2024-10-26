import { SharedSignal } from './shared-signal';
import { SharedStateStore } from './type';
import { createSharedStore } from './shared-store';
export const initStore = <T extends object>(signalRecord: T) => {
  const stateStore = {} as unknown as SharedStateStore<T>;
  const createSharedState = <A>(key: string, value: A) => {
    if (value instanceof Object) {
      stateStore[key] = createSharedStore(value);
      return;
    } else {
      stateStore[key] = new SharedSignal(value);
    }
  };
  Object.keys(signalRecord).forEach((e) => {
    createSharedState(e, signalRecord[e]);
  });
  return stateStore;
};

export default initStore;
