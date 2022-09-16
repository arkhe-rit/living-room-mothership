import { match } from ".";

const interpretRight = match({
  identity: () => null,
  value: ({value}) => value,
  append: ({operands}, match) => (
    operands.length
      ? match(operands.slice(-1)[0])
      : match({tag: 'identity'})
  )
});

const interpretLeft = match({
  identity: () => null,
  value: ({value}) => value,
  append: ({operands}, match) => (
    operands.length
      ? match(operands[0])
      : match({tag: 'identity'})
  )
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

export {
  interpretLeft, 
  interpretRight,
  interpretCount
};