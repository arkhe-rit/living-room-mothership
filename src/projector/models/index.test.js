import { simpleMark, compositeMark } from "./index.js";

test("create a simple mark", () => {
  expect(simpleMark("rose", 0, { x: 0, y: 0 }, { w: 0, h: 0 })).toEqual({
    tag: "simple-mark",
    shape: "rose",
    color: 0,
    position: { x: 0, y: 0 },
    scale: { w: 0, h: 0 }
  });
});

test("create a composite mark", () => {
  expect(
    compositeMark(
      [
        simpleMark("rose", 0, { x: 0, y: 0 }, { w: 0, h: 0 }),
        simpleMark("geranium", 0, { x: 0, y: 0 }, { w: 0, h: 0 })
      ],
      [1, 1],
      { x: 0, y: 0 },
      { w: 0, h: 0 }
    )
  ).toEqual({
    tag: "composite-mark",
    marks: [
      {
        tag: "simple-mark",
        shape: "rose",
        color: 0,
        position: { x: 0, y: 0 },
        scale: { w: 0, h: 0 }
      },
      {
        tag: "simple-mark",
        shape: "geranium",
        color: 0,
        position: { x: 0, y: 0 },
        scale: { w: 0, h: 0 }
      }
    ],
    times: [1, 1],
    position: { x: 0, y: 0 },
    scale: { w: 0, h: 0 }
  });
});
