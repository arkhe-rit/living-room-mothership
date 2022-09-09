import { decodeAlgebra } from "./decodeFlowerAlgebra.js";

test("return {} for identity", () => {
  expect(decodeAlgebra({ arkhe_tag: "identity" })).toEqual({
    tag: "empty-mark",
    shape: "circle",
    color: 0,
    position: { x: 0, y: 0 },
    scale: { w: 1, h: 1 }
  });
});

test("return simpleMark object for value", () => {
  expect(decodeAlgebra({ arkhe_tag: "value", value: "rose" })).toEqual({
    tag: "simple-mark",
    shape: "rose",
    color: 0,
    position: { x: 0, y: 0 },
    scale: { w: 1, h: 1 }
  });
});

test("return compositeMark object for append", () => {
  expect(
    decodeAlgebra({
      arkhe_tag: "append",
      operands: [
        {
          arkhe_tag: "value",
          value: "rose"
        },
        {
          arkhe_tag: "value",
          value: "tulip"
        },
        {
          arkhe_tag: "value",
          value: "geranium"
        },
        {
          arkhe_tag: "value",
          value: "lavender"
        }
      ]
    })
  ).toEqual({
    tag: "composite-mark",
    marks: [
      {
        tag: "simple-mark",
        shape: "rose",
        color: 0,
        position: { x: 0, y: 0 },
        scale: { w: 1, h: 1 }
      },
      {
        tag: "simple-mark",
        shape: "tulip",
        color: 0,
        position: { x: 0, y: 0 },
        scale: { w: 1, h: 1 }
      },
      {
        tag: "simple-mark",
        shape: "geranium",
        color: 0,
        position: { x: 0, y: 0 },
        scale: { w: 1, h: 1 }
      },
      {
        tag: "simple-mark",
        shape: "lavender",
        color: 0,
        position: { x: 0, y: 0 },
        scale: { w: 1, h: 1 }
      }
    ],
    times: [1],
    position: { x: 0, y: 0 },
    scale: { w: 1, h: 1 }
  });
});
