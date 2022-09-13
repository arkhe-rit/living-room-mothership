const IO = (ioFunction = () => {}) => {
  const io = ioFunction.bind({});

  const methods = {
    _tag: 'io',
    run: () => ioFunction(),
    map: (f) => IO(() => {
      return f(ioFunction());
    }),
    flat: () => IO(() => {
      debugger;
      const result = ioFunction();
      if (typeof result === 'function')
        return result();
      if (result._tag === 'io')
        return result.run();
      return result.flat();
    }),
    flatMap: (f) => IO(ioFunction).map(f).flat()
  };

  Object.assign(io, methods);

  return io;
}

export { IO };