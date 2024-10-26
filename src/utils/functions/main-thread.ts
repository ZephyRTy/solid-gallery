export function compressWithMultiThread(srcList: string[]): Promise<string[]> {
  const threadNum = Math.min(4, srcList.length);

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
