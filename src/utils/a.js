function asyncFunction(promise) {
  const generatorFunc = function* () {
    yield promise;
  };
  function handle(generator, result) {
    console.log('handle', result.done, result.value);
    if (result.done) return Promise.resolve(result.value);

    return Promise.resolve(result.value).then(
      (res) => handle(generator, generator.next(res)),
      (err) => handle(generator, generator.throw(err)),
    );
  }

  return function (...args) {
    const generator = generatorFunc(...args);
    return handle(generator, generator.next());
  };
}

const asyncMain = asyncFunction(
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('a');
    }, 1000);
  }),
);

const a = asyncMain();
console.log(a);
console.log('a.js');
