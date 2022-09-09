import { initializeMark } from "./initMarks.js";

test("return a mark with an empty-mark tag and default circle shape", () => {
  expect(initializeMark()).toEqual({
    tag: "empty-mark",
    shape: "circle",
    color: 0,
    position: { x: 0, y: 0 },
    scale: { w: 1, h: 1 }
  });
});
