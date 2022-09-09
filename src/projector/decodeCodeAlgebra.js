import matchAlgebra from "../algebra/matchAlgebra";

const nameToCode = {
  addOne: "(a) => a + 1",
  addThree: "(b) => b + 3"
};

// prettier-ignore
const decodeToArray = matchAlgebra({
    append: ({operands}, match) => {
        return operands.flatMap(match)
    },
    value: ({value}) => {
        return [nameToCode[value.name] || value.name];
    },
    identity: ({}, match) => {
        return [];
    }
});

const decodeAlgebra = alg => {
  const codeArray = decodeToArray(alg);

  const declaration = "const func = ";

  if (codeArray.length === 0) {
    return declaration + "x => x";
  }
  if (codeArray.length === 1) {
    return declaration + codeArray[0];
  }

  const indent = "  ";

  return (
    `const pipe = (f, g) => \n${indent}(...args) => g(f(x))\n\n${declaration}pipe(\n${indent}` +
    codeArray.join(`,\n${indent}`) +
    "\n)"
  );
};

export { decodeAlgebra };
