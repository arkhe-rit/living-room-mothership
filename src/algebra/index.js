const makeAlgebra = (kind) => ({
  identity: () => ({
    kind,
    tag: "identity"
  }),
  append: (algOperands) => ({
    kind,
    tag: "append",
    operands: algOperands
  }),
  value: (val) => ({
    kind,
    tag: "value",
    value: val
  }),

  match: matchObject => 
    function match(alg) {
      if (!("tag" in alg && "kind" in alg && alg.kind === kind))
        throw new TypeError(`Cannot translate an object that does not match the "${kind}" algebra`);

      return matchObject[alg.tag](alg, match);
    }
});

export { makeAlgebra };