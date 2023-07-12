import { match } from "./index.js";

const interpretRight = match({
  identity: () => null,
  value: ({value}) => value,
  append: ({operands}, match) => {
    const nonIds = operands.filter(alg => alg.tag !== 'identity');

    return nonIds.length
      ? match(nonIds.slice(-1)[0])
      : match({tag: 'identity'})
  }
});

const interpretLeft = match({
  identity: () => null,
  value: ({value}) => value,
  append: ({operands}, match) => {
    const nonIds = operands.filter(alg => alg.tag !== 'identity');

    return nonIds.length
      ? match(nonIds[0])
      : match({tag: 'identity'})
  }
});

const interpretCount = match({
  identity: () => 0,
  value: ({value}) => 1,
  append: ({operands}, match) => (
    operands.length
      ? operands.map(match).reduce((a, b) => a + b, 0)
      : match({tag: 'identity'})
  )
});

const interpretList = match({
  identity: () => [undefined],
  value: ({value}) => [value],
  append: ({operands}, match) => (
    operands.length
      ? operands.map(match).flat()
      : []
  )
});

export {
  interpretLeft, 
  interpretRight,
  interpretCount,
  interpretList
};