import { sortCardsArr, cardsToAlgebra } from "./observer";

test("sort by center x value", () => {
  expect(
    sortCardsArr([{ center: [2, 1] }, { center: [3, 1] }, { center: [1, 1] }])
  ).toEqual([{ center: [1, 1] }, { center: [2, 1] }, { center: [3, 1] }]);
});

test("identity", () => {
  expect(cardsToAlgebra([])).toEqual({ arkhe_tag: "identity" });
});

test("value", () => {
  expect(
    cardsToAlgebra([
      {
        object: "function1",
        center: [1, 1],
        corners: [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4]
        ]
      }
    ])
  ).toEqual({
    arkhe_tag: "value",
    value: {
      centerPoint: { x: 1, y: 1 },
      cornerPoints: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
        { x: 4, y: 4 }
      ],
      name: "function1"
    }
  });
});

test("append", () => {
  expect(
    cardsToAlgebra([
      {
        object: "function1",
        center: [1, 1],
        corners: [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4]
        ]
      },
      {
        object: "function2",
        center: [2, 2],
        corners: [
          [1, 1],
          [2, 2],
          [3, 3],
          [4, 4]
        ]
      }
    ])
  ).toEqual({
    arkhe_tag: "append",
    operands: [
      {
        arkhe_tag: "append",
        operands: [
          { arkhe_tag: "identity" },
          {
            arkhe_tag: "value",
            value: {
              centerPoint: { x: 1, y: 1 },
              cornerPoints: [
                { x: 1, y: 1 },
                { x: 2, y: 2 },
                { x: 3, y: 3 },
                { x: 4, y: 4 }
              ],
              name: "function1"
            }
          }
        ]
      },
      {
        arkhe_tag: "value",
        value: {
          centerPoint: { x: 2, y: 2 },
          cornerPoints: [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 4, y: 4 }
          ],
          name: "function2"
        }
      }
    ]
  });
});
