import { ObjectAsSignal } from './type';

export const getter = <T extends object>(store: T, path: string[]) => {
  return path.reduce((acc, curr) => {
    return acc[curr];
  }, store);
};

export const asSignal = <T>(value: T): ObjectAsSignal<T> => {
  Object.defineProperty(value, '$$asSignal', {
    value: true,
  });
  return value as ObjectAsSignal<T>;
};
