import { identity, value, append } from "./projector";

const pipe2 =
  (f, g) =>
  (...args) =>
    g(f(...args));
const pipe = (...fs) => fs.reduce(pipe2);

const sortCardsArr = cardsArr => {
  return cardsArr.sort((a, b) => a.center[0] - b.center[0]);
};

const filterCardsArr = cardsArr => {
  const first = cardsArr[0];

  return cardsArr.filter(
    a =>
      a.center[1] >= first.center[1] - first.center[1] / 2 &&
      a.center[1] <= first.center[1] + first.center[1] / 2
  );
};

const cardsArrToAlgebra = cardsArr => {
  if (cardsArr.length > 1) {
    let algebra = { arkhe_tag: "identity" };

    cardsArr.forEach(obj => {
      let valueAlgebra = value({
        name: obj.object,
        centerPoint: { x: obj.center[0], y: obj.center[1] },
        cornerPoints: [
          { x: obj.corners[0][0], y: obj.corners[0][1] },
          { x: obj.corners[1][0], y: obj.corners[1][1] },
          { x: obj.corners[2][0], y: obj.corners[2][1] },
          { x: obj.corners[3][0], y: obj.corners[3][1] }
        ]
      });

      algebra = append([algebra, valueAlgebra]);
    });

    return algebra;
  } else if (cardsArr.length === 1) {
    const obj = cardsArr[0];

    return value({
      name: obj.object,
      centerPoint: { x: obj.center[0], y: obj.center[1] },
      cornerPoints: [
        { x: obj.corners[0][0], y: obj.corners[0][1] },
        { x: obj.corners[1][0], y: obj.corners[1][1] },
        { x: obj.corners[2][0], y: obj.corners[2][1] },
        { x: obj.corners[3][0], y: obj.corners[3][1] }
      ]
    });
  } else {
    return identity();
  }
};

const cardsToAlgebra = pipe(sortCardsArr, filterCardsArr, cardsArrToAlgebra);

export { sortCardsArr, cardsToAlgebra };
