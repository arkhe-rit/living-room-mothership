import { simpleMark, compositeMark } from "./models/index.js";
import { initializeMark } from "./models/initMarks.js";

const decodeAlgebra = alg =>
  ({
    append: ({ operands, details: { times, position, scale } = {} }) => {
      const marksArr = operands.map(decodeAlgebra);

      return compositeMark(marksArr, times, position, scale);
    },
    identity: () => {
      return initializeMark();
    },
    value: ({ value, details: { color, position, scale } = {} }) => {
      return simpleMark(value, color, position, scale);
    }
  }[alg.arkhe_tag](alg));

export { decodeAlgebra };
