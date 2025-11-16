// hooks/useFabricSelection.js
import { useState, useEffect } from "react";
import { handleObjectSelected } from "../utils/handleObjectSelected";

export function useFabricSelection(canvas) {
  const [selectedObject, setSelectedObject] = useState(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [diameter, setDiameter] = useState("");
  const [color, setColor] = useState("");
  const [strokeColor, setStrokeColor] = useState("");
  const [stroke, setStroke] = useState("");
  const [font, setFont] = useState("");
  const [fontSize, setFontSize] = useState("");
  const [fontWeight, setFontWeight] = useState("");
  const [textAlign, setTextAlign] = useState("");
  const [opacity, setOpacity] = useState("");
  const [angle, setAngle] = useState("");
  useEffect(() => {
    if (!canvas) return;

    const setters = {
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
    };

    const onCreated = (e) => handleObjectSelected(e.selected[0], setters);
    const onUpdated = (e) => handleObjectSelected(e.selected[0], setters);
    const onModified = (e) => handleObjectSelected(e.target, setters);
    const onScaling = (e) => handleObjectSelected(e.target, setters);
    const onCleared = () => {
      setSelectedObject(null);
      setWidth("");
      setHeight("");
      setDiameter("");
      setColor("");
    };

    canvas.on("selection:created", onCreated);
    canvas.on("selection:updated", onUpdated);
    canvas.on("object:modified", onModified);
    canvas.on("object:scaling", onScaling);
    canvas.on("selection:cleared", onCleared);

    return () => {
      canvas.off("selection:created", onCreated);
      canvas.off("selection:updated", onUpdated);
      canvas.off("object:modified", onModified);
      canvas.off("object:scaling", onScaling);
      canvas.off("selection:cleared", onCleared);
    };
  }, [canvas]);

  return {
    selectedObject,
    width,
    height,
    diameter,
    font,
    fontSize,
    fontWeight,
    textAlign,
    color,
    stroke,
    angle,
    setAngle,
    strokeColor,
    opacity,
    setOpacity,
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
  };
}
