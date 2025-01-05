import { compressMultiThread } from './compressThumbMultiThread';

onmessage = (message) => {
  compressMultiThread(message.data.src).then((res) => {
    postMessage({
      src: res?.imageData,
      err: res?.err,
    });
  });
};
