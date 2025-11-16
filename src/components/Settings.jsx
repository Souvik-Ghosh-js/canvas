import { useFabricSelection } from "../hooks/useFabricSelection";
import RectProperties from "./RectProperties";
import CircleProperties from "./CircleProperties";
import TextProperties from "./TextProperties";
import CanvasProperties from "./CanvasProperties";
import { useEffect, useState } from "react";
import ImageProperties from "./ImageProperties";
import { applyMask } from "../utils/imageMask";
import { loadCustomFont } from "../utils/loadCustomFont";

function Settings({ canvas, isSideBarOpen }) {
  const [canvasWidth, setCanvasWidth] = useState("");
  const [canvasHeight, setCanvasHeight] = useState("");
  const [canvasColor, setCanvasColor] = useState("");
  const {
    selectedObject,
    width,
    height,
    diameter,
    opacity,
    setOpacity,
    color,
    stroke,
    strokeColor,
    fontSize,
    font,
    angle,
    setAngle,
    fontWeight,
    textAlign,
    setWidth,
    setHeight,
    setDiameter,
    setColor,
    setStroke,
    setStrokeColor,
    setFontSize,
    setTextAlign,
  } = useFabricSelection(canvas);
  useEffect(() => {
    if (canvas) {
      setCanvasHeight(canvas.getHeight());
      setCanvasWidth(canvas.getWidth());
      setCanvasColor(canvas.backgroundColor);
    }
  }, [canvas]);

  const handleCanvasColorChange = (e) => {
    const value = e.target.value;
    setCanvasColor(value);
    if (canvas) {
      canvas.backgroundColor = value;
      canvas.renderAll();
    }
  };
  // Handlers (unchanged, but now use hook state)
  const handleWidthChange = (e) => {
    const intValue = parseInt(e.target.value.replace(/,/g, ""), 10);
    setWidth(intValue);
    if (selectedObject && intValue >= 0) {
      selectedObject.set({ width: intValue / selectedObject.scaleX });
      canvas.renderAll();
    }
  };

  const handleHeightChange = (e) => {
    const intValue = parseInt(e.target.value.replace(/,/g, ""), 10);
    setHeight(intValue);
    if (selectedObject && intValue >= 0) {
      selectedObject.set({ height: intValue / selectedObject.scaleY });
      canvas.renderAll();
    }
  };

  const handleColorChange = (e) => {
    const value = e.target.value;
    setColor(value);
    if (selectedObject) {
      selectedObject.set({ fill: value });
      canvas.renderAll();
    }
  };
  const handleStrokeColorChange = (e) => {
    const value = e.target.value;
    setStrokeColor(value);
    if (selectedObject) {
      selectedObject.set({ stroke: value });
      canvas.renderAll();
    }
  };
  const handleDiameterChange = (e) => {
    const intValue = parseInt(e.target.value.replace(/,/g, ""), 10);
    setDiameter(intValue);
    if (selectedObject?.type === "circle" && intValue > 0) {
      selectedObject.set({ radius: intValue / 2 / selectedObject.scaleX });
      canvas.renderAll();
    }
  };
  const handleStrokeChange = (e) => {
    const intValue = parseInt(e.target.value.replace(/,/g, ""), 10);
    setStroke(intValue);
    if (selectedObject && intValue >= 0) {
      selectedObject.set({ strokeWidth: intValue });
      canvas.renderAll();
    }
  };
  const handleFontSizeChange = (e) => {
    const intValue = parseInt(e.target.value.replace(/,/g, ""), 10);
    setFontSize(intValue);
    if (selectedObject?.type === "textbox" && intValue > 0) {
      selectedObject.set({ fontSize: intValue });
      canvas.renderAll();
    }
  };
  const handleFontWeightChange = (e) => {
    const value = Number(e.target.value);
    if (selectedObject?.type === "textbox") {
      selectedObject.set({ fontWeight: value });
      canvas.renderAll();
    }
  };
  const handleFontChange = async (e) => {
    await loadCustomFont("Noto Sans Bengali");
    const value = e.target.value;
    if (selectedObject?.type === "textbox") {
      selectedObject.set({ fontFamily: value });
      canvas.renderAll();
    }
  };
  const handleTextAlign = (e) => {
    const value = e.target.value;
    setTextAlign(value);
    if (selectedObject?.type === "textbox") {
      selectedObject.set({ textAlign: value });
      canvas.renderAll();
    }
  };
  const handleOpacityChange = (e) => {
    let value = e.target.value;
    value = value / 100;
    setOpacity(value);
    if (selectedObject) {
      selectedObject.set({ opacity: value });
      canvas.renderAll();
    }
  };

  const horizontallyFlip = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ flipX: !activeObject.flipX });
      canvas.renderAll();
    }
  };

  const verticallyFlip = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ flipY: !activeObject.flipY });
      canvas.renderAll();
    }
  };

  return (
    <div
      className={`bg-white w-[230px] py-2 transition-all fixed md:right-0 z-99 ${
        isSideBarOpen ? "right-0" : "-right-full"
      }
    `}
    >
      <section className="px-5">
        <h1 className="font-semibold text-xl">Tool Properties</h1>
      </section>
      <hr className="border-gray-200 my-2" />
      {!selectedObject && (
        <CanvasProperties
          height={canvasHeight}
          width={canvasWidth}
          color={canvasColor}
          onColorChange={handleCanvasColorChange}
        />
      )}
      {selectedObject?.type === "rect" && (
        <RectProperties
          width={width}
          height={height}
          color={color}
          stroke={stroke}
          strokeColor={strokeColor}
          onStrokeChange={handleStrokeChange}
          onStrokeColorChange={handleStrokeColorChange}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          onColorChange={handleColorChange}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
        />
      )}
      {selectedObject?.type === "triangle" && (
        <RectProperties
          width={width}
          height={height}
          color={color}
          stroke={stroke}
          strokeColor={strokeColor}
          onStrokeChange={handleStrokeChange}
          onStrokeColorChange={handleStrokeColorChange}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          onColorChange={handleColorChange}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
        />
      )}
      {selectedObject?.type === "circle" && (
        <CircleProperties
          diameter={diameter}
          stroke={stroke}
          strokeColor={strokeColor}
          color={color}
          onDiameterChange={handleDiameterChange}
          onStrokeChange={handleStrokeChange}
          onColorChange={handleColorChange}
          onStrokeColorChange={handleStrokeColorChange}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
        />
      )}
      {selectedObject?.type === "textbox" && (
        <TextProperties
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          fontWeight={fontWeight}
          font={font}
          textAlign={textAlign}
          onFontWeightChange={handleFontWeightChange}
          onColorChange={handleColorChange}
          onFontChange={handleFontChange}
          canvas={canvas}
          onTextAlign={handleTextAlign}
          color={color}
          opacity={opacity}
          onOpacityChange={handleOpacityChange}
        />
      )}
      {selectedObject?.type === "image" && (
        <ImageProperties
          height={height}
          width={width}
          onWidthChange={handleWidthChange}
          onHeightChange={handleHeightChange}
          onApplyMask={(shape) => applyMask(canvas, shape)}
          onHFlip={horizontallyFlip}
          onVFlip={verticallyFlip}
        />
      )}
    </div>
  );
}

export default Settings;
