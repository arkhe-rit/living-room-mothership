import { identity, append, value } from "../algebra/projector.js";
import matchAlgebra from "../algebra/matchAlgebra.js";

const funcDb = {
  cardOne: "toString"
};

const convertAlgebra = (observerAlg, database) => {
  let data = processAlgebra(observerAlg).map(cardName => {
    if (cardName === Symbol.for("identity") || !(cardName in database)) {
      return identity();
    }

    return value(database[cardName]);
  });

  data = data.filter(algebra => {
    return algebra.arkhe_tag !== "identity";
  });

  if (data.length === 0) {
    return identity();
  }

  if (data.length === 1) {
    return data[0];
  }

  return append(data);
};

//processing algebra for projector
const processAlgebra = algFromObserver => {
  const process = matchAlgebra({
    append: ({ operands }) => operands.flatMap(process),
    value: ({ value }) => [value],
    identity: () => [Symbol.for("identity")]
  });

  return process(algFromObserver);
};

export { convertAlgebra };
