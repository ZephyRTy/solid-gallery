const fs = window.require('fs');

export function compressWithMultiThread(srcList: string[]): Promise<string[]> {
  const threadNum = Math.min(12, srcList.length);

  let count = srcList.length;
  const resArr = new Array<string>(count);
  const workers: Worker[] = [];
  return new Promise((resolve) => {
    const createWorker = (index: number) => {
      const worker = new Worker(
        new URL('./worker-thread.js', import.meta.url),
        {
          type: 'module',
        },
      );
      let current = index;
      workers.push(worker);
      worker.postMessage({ src: srcList[index] });
      worker.onmessage = (e) => {
        resArr[current] = e.data.src;

        current += threadNum;
        count -= 1;
        if (count <= 0) {
          resolve(resArr as string[]);
          worker.terminate();
          return;
        } else if (current >= srcList.length || !srcList[current]) {
          worker.terminate();
          return;
        } else {
          worker.postMessage({ src: srcList[current] });
        }
      };
    };

    for (let i = 0; i < threadNum; ++i) {
      createWorker(i);
    }
  });
}

// export function compressWasm(srcList: string[]): Promise<string[]> {
//   const threadNum = Math.min(4, srcList.length);

//   const imageData = srcList.map((src) => {
//     const buffer = fs.readFileSync(src.replace('file://', ''));
//     return new Uint8Array(buffer);
//   });

//   let count = threadNum;
//   const batchSize = Math.floor(imageData.length / threadNum);
//   const mod = imageData.length % threadNum;
//   let current = 0;
//   const resArr = new Array<string[]>(threadNum);
//   const workers: Worker[] = [];
//   return new Promise((resolve) => {
//     const createWorker = (index: number) => {
//       const worker = new Worker(new URL('./worker-wasm.js', import.meta.url), {
//         type: 'module',
//       });
//       let bound: number[];
//       if (index < mod) {
//         bound = [current, current + batchSize + 1];
//         current += batchSize + 1;
//       } else {
//         bound = [current, current + batchSize];
//         current += batchSize;
//       }
//       workers.push(worker);
//       worker.postMessage({ src: imageData.slice(bound[0], bound[1]) });
//       worker.onmessage = (e) => {
//         resArr[index] = e.data.src;
//         count -= 1;
//         if (count <= 0) {
//           resolve(resArr.flat());
//           worker.terminate();
//           return;
//         }
//         worker.terminate();
//       };
//     };

//     for (let i = 0; i < threadNum; ++i) {
//       createWorker(i);
//     }
//   });
// }
