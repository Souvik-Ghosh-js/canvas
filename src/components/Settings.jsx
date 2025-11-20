import { useFabricSelection } from "../hooks/useFabricSelection";
import RectProperties from "./RectProperties";
import CircleProperties from "./CircleProperties";
import TextProperties from "./TextProperties";
import CanvasProperties from "./CanvasProperties";
import { useEffect, useState } from "react";
import ImageProperties from "./ImageProperties";
import { applyMask } from "../utils/imageMask";
import { loadCustomFont } from "../utils/loadCustomFont";
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Settings as SettingsIcon,
} from "lucide-react";

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

  const rotateObject = (degrees) => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate(activeObject.angle + degrees);
      canvas.renderAll();
    }
  };

  return (
    <div
      className={`bg-linear-to-b from-white to-blue-50/30 w-80  py-4 transition-all duration-300 h-full overflow-y-scroll md:right-0 z-50 absolute md:relative  border-l border-gray-200/50 shadow-xl ${
        isSideBarOpen ? "right-0" : "-right-full"
      }`}
    >
      {/* Header */}
      <section className="px-6 pb-4 border-b border-gray-200/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md">
            <SettingsIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Properties
            </h1>
            <p className="text-xs text-gray-500">
              {selectedObject
                ? `${
                    selectedObject.type.charAt(0).toUpperCase() +
                    selectedObject.type.slice(1)
                  } Settings`
                : "Canvas Settings"}
            </p>
          </div>
        </div>
      </section>

      {/* Transform Controls */}
      {selectedObject && (
        <section className="px-6 py-4 border-b border-gray-200/50 bg-white/50 rounded-lg mx-4 my-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            Transform
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => rotateObject(-15)}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-sm flex flex-col items-center gap-1"
              title="Rotate -15°"
            >
              <RotateCw size={16} className="text-gray-600" />
              <span className="text-xs text-gray-600">-15°</span>
            </button>
            <button
              onClick={horizontallyFlip}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-sm flex flex-col items-center gap-1"
              title="Flip Horizontal"
            >
              <FlipHorizontal size={16} className="text-gray-600" />
              <span className="text-xs text-gray-600">Flip H</span>
            </button>
            <button
              onClick={verticallyFlip}
              className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all shadow-sm flex flex-col items-center gap-1"
              title="Flip Vertical"
            >
              <FlipVertical size={16} className="text-gray-600" />
              <span className="text-xs text-gray-600">Flip V</span>
            </button>
          </div>
        </section>
      )}

      {/* Properties Sections */}
      <div className="px-4 space-y-4">
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

      {/* Empty State */}
      {!selectedObject && (
        <div className="px-6 py-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SettingsIcon className="text-gray-400" size={24} />
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            No Object Selected
          </h3>
          <p className="text-xs text-gray-500">
            Select an object on the canvas to edit its properties
          </p>
        </div>
      )}
    </div>
  );
}

export default Settings;