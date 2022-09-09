const identity = () => ({
  arkhe_tag: "identity"
});

const append = algOperands => ({
  arkhe_tag: "append",
  operands: algOperands
});

const value = val => ({
  arkhe_tag: "value",
  value: val
});

export { identity, append, value };
