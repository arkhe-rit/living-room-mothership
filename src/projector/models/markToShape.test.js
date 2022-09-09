import { compositeMark, simpleMark } from "./index.js";
import { initializeMark } from "./initMarks.js";
import { marksToShapes } from "./markToShape.js";

test("returns an array containing string circle", () => {
  expect(marksToShapes(initializeMark())).toEqual(["circle"]);
});

test("returns an array containing string rose", () => {
  expect(
    marksToShapes(simpleMark("rose", 0, { x: 1, y: 1 }, { w: 1, h: 1 }))
  ).toEqual(["rose"]);
});

test("returns an array containing strings rose and tulip", () => {
  expect(
    marksToShapes(
      compositeMark(
        [
          simpleMark("rose", 0, { x: 1, y: 1 }, { w: 1, h: 1 }),
          simpleMark("tulip", 0, { x: 1, y: 1 }, { w: 1, h: 1 })
        ],
        [1, 1],
        { x: 1, y: 1 },
        { w: 1, h: 1 }
      )
    )
  ).toEqual(["rose", "tulip"]);
});
