const IO = (ioFunction) => {
  return {
    _tag: 'io',
    run: () => ioFunction(),
    map: (f) => IO(() => {
      return f(ioFunction());
    }),
    flat: () => IO(() => {
      const result = ioFunction();
      if (typeof result === 'function')
        return result();
      if (result._tag === 'io')
        return result.run();
      return result.flat();
    }),
    flatMap: (f) => IO(ioFunction).map(f).flat()
  }
}

export { IO };