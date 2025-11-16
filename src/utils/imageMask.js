import { Rect, Circle, Path, Polygon } from "fabric";

const getMaskPath = (shape) => {
  const rect = new Rect({
    width: 400,
    height: 400,
    originX: "center",
    originY: "center",
  });
  const circle = new Circle({
    radius: 260,
    originX: "center",
    originY: "center",
  });
  const heartPath = new Path(
    "M 272 272 C 272 170 128 170 128 272 C 128 372 272 412 272 512 C 272 412 416 372 416 272 C 416 170 272 170 272 272 Z",
    {
      left: 0,
      top: 0,
      originX: "center",
      originY: "center",
      scaleX: 1.5,
      scaleY: 1.5,
    }
  );
  const starPath = new Path(
    "M 250,75 L 323,301 L 131,161 L 369,161 L 177,301 Z",
    {
      left: 0,
      top: 0,
      originX: "center",
      originY: "center",
      scaleX: 2,
      scaleY: 2,
    }
  );

  const size = 100; // radius or side size of hexagon

  // Generate 6 points for the hexagon
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // rotated to flat-top hexagon
    points.push({
      x: size * Math.cos(angle),
      y: size * Math.sin(angle),
    });
  }
  const hexagon = new Polygon(points, {
    originX: "center",
    originY: "center",
    scaleX: 1.5,
    scaleY: 1.5,
  });
  switch (shape) {
    case "circle":
      return circle;

    case "square":
      return rect;

    case "heart":
      return heartPath;

    case "star":
      return starPath;

    case "hexagon":
      return hexagon;

    default:
      return "";
  }
};

export const applyMask = (canvas, shape) => {
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type === "image") {
    const mask = getMaskPath(shape, 300, 300);
    activeObject.set({ clipPath: mask });
  }
  canvas.renderAll();
};
