export const getter = <T extends object>(store: T, path: string[]) => {
  return path.reduce((acc, curr) => {
    return acc[curr];
  }, store);
};
