import { createStore } from 'solid-js/store';
import { VirtualStore } from './type';
import { Memo } from './memo';

const getter = <T extends object>(store: T, path: string[]) => {
  return path.reduce((acc, curr) => {
    return acc[curr];
  }, store);
};

export const createSharedStore = <T extends NonNullable<object>>(
  initialState: T,
) => {
  const [store, setStore] = createStore(initialState);
  let path: string[] = [];
  const memo = new Memo<T>();
  const handler = {
    get: function (obj, prop) {
      if (prop === 'get') {
        const args = [...path];
        path = [];
        const fn = memo.getter(() => getter(store, [...args]), args);
        return fn;
      } else if (prop === 'set') {
        return (value: any) => {
          (setStore as any).apply(null, [...path, value] as any);
          path = [];
        };
      }
      path.push(prop.toString());
      if (prop in obj) {
        return obj[prop];
      }
      const newProp = new Proxy({}, handler);
      return newProp;
    },
    set: function (_obj, prop, value) {
      path.push(prop);
      (setStore as any).apply(null, [...path, value] as any);
      return true;
    },
  };

  const topHandler = {
    get: function (obj, prop) {
      path = [prop];
      if (prop in obj) {
        return obj[prop];
      }
      const newProp = new Proxy({}, handler);
      return newProp;
    },

    set: function (_obj, prop, value) {
      path.push(prop);
      (setStore as any).apply(null, [...path, value] as any);
      return true;
    },
  };

  return new Proxy({}, topHandler) as VirtualStore<T>;
};
