import { createStore } from 'solid-js/store';
import { StoreOperations, VirtualStore } from './type';
import { Memo } from './memo';
import { getter as getValue } from './utils';

export const createSharedStore = <T extends NonNullable<object>>(
  initialState: T,
) => {
  const [store, setStore] = createStore(initialState);
  let path: string[] = [];
  const memo = new Memo<T>();
  const handler = {
    get: function (obj, prop: string) {
      const args = [...path];
      const current = getValue(store, [...args]);
      if (prop === 'get') {
        path = [];
        const fn = memo.getter(() => getValue(store, [...args]), args);
        return fn;
      } else if (prop === 'set') {
        return (value: any) => {
          (setStore as any).apply(null, [...path, value] as any);
          path = [];
        };
      } else if (prop === 'push' && current instanceof Array) {
        return (value: any) => {
          obj[obj.length].set(value);
          path = [];
        };
      }
      path.push(prop.toString());
      if (prop in obj) {
        return obj[prop];
      }
      const newProp = new Proxy(() => {}, handler);
      obj[prop] = newProp;
      return newProp;
    },

    apply: function (_obj, _prop) {
      const v = getValue(store, [...path]);
      return v;
    },
  };

  const topHandler = {
    get: function (obj, prop) {
      path = [prop];
      if (prop in obj) {
        return obj[prop];
      }
      if (prop === 'push') {
        return (value: any) => {
          (setStore as any)((store as Array<any>).length, value);
        };
      }
      const newProp = new Proxy(() => {}, handler);
      obj[prop] = newProp;
      return newProp;
    },

    set: function (_obj, prop, value) {
      path.push(prop);
      (setStore as any).apply(null, [...path, value] as any);
      return true;
    },
  };

  return new Proxy(
    {
      get: () => store,
      pureSet: setStore,
    },
    topHandler,
  ) as VirtualStore<T> & StoreOperations<T>;
};
