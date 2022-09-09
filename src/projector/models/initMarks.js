const initializeMark = (
  color = 0,
  position = { x: 0, y: 0 },
  scale = { w: 1, h: 1 }
) => ({
  tag: "empty-mark",
  shape: "circle", //initial shape
  color: color,
  position: position,
  scale: scale
});

export { initializeMark };
