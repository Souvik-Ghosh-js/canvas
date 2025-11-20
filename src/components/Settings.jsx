import { useFabricSelection } from "../hooks/useFabricSelection";
import RectProperties from "./RectProperties";
import CircleProperties from "./CircleProperties";
import TextProperties from "./TextProperties";
import CanvasProperties from "./CanvasProperties";
import { useEffect, useState, useRef } from "react";
import ImageProperties from "./ImageProperties";
import { applyMask } from "../utils/imageMask";
import { loadCustomFont } from "../utils/loadCustomFont";
import {
  ZoomIn,
  ZoomOut,
  Hand,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Settings as SettingsIcon,
} from "lucide-react";

function Settings({ canvas, isSideBarOpen }) {
  const [canvasWidth, setCanvasWidth] = useState("");
  const [canvasHeight, setCanvasHeight] = useState("");
  const [canvasColor, setCanvasColor] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const panningRef = useRef(false);
  const lastPosXRef = useRef(0);
  const lastPosYRef = useRef(0);

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

      const currentZoom = canvas.getZoom() * 100;
      setZoomLevel(Math.round(currentZoom));

      setupCanvasPanning();
    }

    return () => {
      if (canvas) {
        canvas.off("mouse:down");
        canvas.off("mouse:move");
        canvas.off("mouse:up");
      }
    };
  }, [canvas]);

  const setupCanvasPanning = () => {
    if (!canvas) return;

    canvas.on("mouse:down", (options) => {
      if (isPanning && options.e && canvas.getZoom() > 1) {
        panningRef.current = true;
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
        lastPosXRef.current = options.e.clientX;
        lastPosYRef.current = options.e.clientY;
      }
    });

    canvas.on("mouse:move", (options) => {
      if (panningRef.current && options.e) {
        const vpt = canvas.viewportTransform;
        const deltaX = options.e.clientX - lastPosXRef.current;
        const deltaY = options.e.clientY - lastPosYRef.current;

        vpt[4] += deltaX;
        vpt[5] += deltaY;

        canvas.setViewportTransform(vpt);
        canvas.requestRenderAll();

        lastPosXRef.current = options.e.clientX;
        lastPosYRef.current = options.e.clientY;
      }
    });

    canvas.on("mouse:up", () => {
      if (isPanning) {
        panningRef.current = false;
        canvas.defaultCursor = "grab";
      }
    });
  };

  const togglePanMode = () => {
    const newPanningState = !isPanning;
    setIsPanning(newPanningState);

    if (canvas) {
      canvas.selection = !newPanningState;
      canvas.defaultCursor = newPanningState ? "grab" : "default";

      if (!newPanningState) {
        panningRef.current = false;
      }
    }
  };

  const handleZoomChange = (e) => {
    const newZoom = parseInt(e.target.value);
    setZoomLevel(newZoom);
    applyZoom(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200);
    setZoomLevel(newZoom);
    applyZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 10);
    setZoomLevel(newZoom);
    applyZoom(newZoom);
  };

  const applyZoom = (zoom) => {
    if (canvas) {
      const zoomFactor = zoom / 100;
      canvas.setZoom(zoomFactor);
      centerViewport();
      canvas.renderAll();
    }
  };

  const centerViewport = () => {
    if (canvas) {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const zoom = canvas.getZoom();

      canvas.viewportTransform[4] = (canvasWidth - canvasWidth * zoom) / 2;
      canvas.viewportTransform[5] = (canvasHeight - canvasHeight * zoom) / 2;
      canvas.setViewportTransform(canvas.viewportTransform);
    }
  };

  const resetZoom = () => {
    setZoomLevel(100);
    applyZoom(100);
    setIsPanning(false);

    if (canvas) {
      canvas.selection = true;
      canvas.defaultCursor = "default";
    }
  };

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

      {/* Zoom & Navigation Section */}
      <section className="px-6 py-4 border-b border-gray-200/50 bg-white/50 rounded-lg mx-4 my-3">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            View Controls
          </label>
          <button
            onClick={resetZoom}
            className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-3 py-1 rounded-full font-medium transition-all shadow-sm"
          >
            Reset
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Zoom Level
            </span>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {zoomLevel}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 10}
              className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:from-gray-50 disabled:to-gray-100 disabled:opacity-50 transition-all shadow-sm"
              title="Zoom Out"
            >
              <ZoomOut size={18} className="text-gray-600" />
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="10"
                max="200"
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="p-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:from-gray-50 disabled:to-gray-100 disabled:opacity-50 transition-all shadow-sm"
              title="Zoom In"
            >
              <ZoomIn size={18} className="text-gray-600" />
            </button>
          </div>

          <div className="flex justify-between text-xs text-gray-500 px-1">
            <span>10%</span>
            <span>100%</span>
            <span>200%</span>
          </div>
        </div>

        {/* Pan Mode Toggle */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-gray-700 block">
                Pan Mode
              </span>
              <span className="text-xs text-gray-500">
                Click and drag to navigate
              </span>
            </div>
            <button
              onClick={togglePanMode}
              className={`p-3 rounded-xl transition-all duration-300 shadow-sm ${
                isPanning
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
              title={isPanning ? "Disable panning" : "Enable panning"}
            >
              <Hand size={18} />
            </button>
          </div>

          {isPanning && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              Pan mode active - Click and drag to move canvas
            </div>
          )}
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
