const marksToShapes = obj => {
  let shapes = [];

  if (obj.tag === "simple-mark" || obj.tag === "empty-mark") {
    shapes.push(obj.shape);
  } else if (obj.tag === "composite-mark") {
    let marksArr = obj.marks;

    for (let i = 0; i < marksArr.length; i++) {
      shapes.push(marksArr[i].shape);
    }
  }

  return shapes;
};

export { marksToShapes };
