const simpleMark = (
  shape,
  color = 0,
  position = { x: 0, y: 0 },
  scale = { w: 1, h: 1 }
) =>
  Object.freeze({
    tag: "simple-mark",
    shape: shape, //string
    color: color,
    position: position, //{x, y}
    scale: scale //{w, h}
  });

const compositeMark = (
  marks,
  times = [1],
  position = { x: 0, y: 0 },
  scale = { w: 1, h: 1 }
) =>
  Object.freeze({
    tag: "composite-mark",
    marks: marks, //[simpleMark, simpleMark, compositeMark, ...]
    //times - matches # of marks, each mark has a designated time that it will stay on the canvas for (not accounting for transition between 2 marks)
    times: times, //[1, 1, 2, ...]
    position: position, //{x, y}
    scale: scale //{w, h}
  });

export { simpleMark, compositeMark };
