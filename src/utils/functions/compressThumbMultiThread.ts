export const compressMultiThread = async (src: string) => {
  // const module = await import('../pkg');
  // const res = module.compress_images_to_base64([src])[0];
  // return { imageData: res };
  const sharp = require('sharp');
  let imgSrc = src;
  try {
    let buffer = await sharp(imgSrc).resize(500).toBuffer();
    const base64String = 'data:image/jpeg;base64,' + buffer.toString('base64');
    buffer = null;
    return { imageData: base64String };
  } catch (e: any) {
    console.log('error', e);
    return { imageData: src };
  }
};

// export const compressWithWasm = async (imgSrcList: Uint8Array[]) => {
//   const module = await import('../pkg');
//   // 从imgPathList中获取图片路径，并读取
//   return module.compress_images_to_base64(imgSrcList);
// };
