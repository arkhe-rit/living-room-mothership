const pipe2 = (f, g) => (...args) => g(f(...args));

const pipe = (...fs) => fs.reduce(pipe2);

export { pipe2, pipe }