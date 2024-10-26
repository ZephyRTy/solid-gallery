const sharp = require('sharp');
const getLegalUrl = (url: string) => {
  return String.raw`${url.replace(/\\/g, '/')}`
    .replaceAll(/%/g, encodeURIComponent('%'))
    .replaceAll(/\s/g, encodeURIComponent(' '))
    .replaceAll(/#/g, encodeURIComponent('#'));
};
export const compressMultiThread = async (src: string) => {
  let imgSrc = src;
  try {
    const buffer = await sharp(imgSrc).resize(500).toBuffer();
    const base64String = 'data:image/jpeg;base64,' + buffer.toString('base64');
    return { imageData: base64String };
  } catch (e: any) {
    return { imageData: src };
  }
};
