export const fuzzyMatch = (pattern: string, text: string): boolean => {
  const regex = pattern
    .split('')
    .map((char) => `.*${char}`)
    .join('');
  return new RegExp(regex, 'i').test(text);
};
