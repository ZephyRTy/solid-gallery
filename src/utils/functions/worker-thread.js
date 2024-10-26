import { compressMultiThread } from './compressThumbMultiThread';

onmessage = (message) => {
  compressMultiThread(message.data.src).then((res) => {
    if (!res) {
      console.log(message.data.src);
    }
    postMessage({
      src: res?.imageData,
      err: res?.err,
    });
  });
};
