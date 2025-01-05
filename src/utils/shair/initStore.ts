import { SharedStateStore } from './type';
import { createSharedStore } from './shared-store';
import { SharedSignal } from './shared-signal';
export const initStore = <T extends object>(signalRecord: T) => {
  const stateStore = {} as unknown as SharedStateStore<T>;
  const createSharedState = <A>(key: string, value: A) => {
    if (value instanceof Object && !(value as any).$$asSignal) {
      stateStore[key] = createSharedStore(value);
      return;
    } else {
      stateStore[key] = SharedSignal.create(value);
    }
  };
  Object.keys(signalRecord).forEach((e) => {
    createSharedState(e, signalRecord[e]);
  });
  return stateStore;
};

export default initStore;
