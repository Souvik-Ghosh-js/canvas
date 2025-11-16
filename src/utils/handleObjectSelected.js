// utils/handleObjectSelected.js
export function handleObjectSelected(object, setters) {
  if (!object) return;

  const {
    setSelectedObject,
    setWidth,
    setHeight,
    setDiameter,
    setColor,
    setStroke,
    setStrokeColor,
    setFont,
    setFontSize,
    setFontWeight,
    setTextAlign,
    setOpacity,
    setAngle,
  } = setters;
  setOpacity(object.opacity);
  setAngle(object.angle);
  setSelectedObject(object);

  switch (object.type) {
    case "rect":
      setWidth(Math.round(object.width * object.scaleX));
      setHeight(Math.round(object.height * object.scaleY));
      setColor(object.fill || "");
      setStroke(object.strokeWidth);
      setStrokeColor(object.stroke);
      setDiameter("");
      // setRadiusX(object.rx || "");
      // setRadiusY(object.ry || "");
      break;

    case "circle":
      setDiameter(Math.round(object.radius * 2 * object.scaleX));
      setColor(object.fill || "");
      setStroke(object.strokeWidth);
      setStrokeColor(object.stroke);
      setWidth("");
      setHeight("");
      break;

    case "triangle":
      setWidth(Math.round(object.width * object.scaleX));
      setHeight(Math.round(object.height * object.scaleY));
      setStroke(object.strokeWidth);
      setStrokeColor(object.stroke);
      setColor(object.fill || "");
      setDiameter("");
      break;

    case "textbox":
      setWidth(Math.round(object.width * object.scaleX));
      setHeight(Math.round(object.height * object.scaleY));
      setColor(object.fill || "");
      setFont(object.fontFamily);
      setFontSize(object.fontSize);
      setFontWeight(object.fontWeight);
      setTextAlign(object.textAlign);
      setDiameter("");
      break;
    case "image":
      setWidth(Math.round(object.width * object.scaleX));
      setHeight(Math.round(object.height * object.scaleY));
      setDiameter("");
      setColor("");
      break;
    default:
      // fallback for unsupported types
      setWidth("");
      setHeight("");
      setDiameter("");
      setColor(object.fill || "");
      break;
  }
}
