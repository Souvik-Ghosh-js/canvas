import { useFabricSelection } from "../hooks/useFabricSelection";
import RectProperties from "./RectProperties";
import CircleProperties from "./CircleProperties";
import TextProperties from "./TextProperties";
import CanvasProperties from "./CanvasProperties";
import { useEffect, useState, useRef } from "react"; // Add useRef
import ImageProperties from "./ImageProperties";
import { applyMask } from "../utils/imageMask";
import { loadCustomFont } from "../utils/loadCustomFont";
import { ZoomIn, ZoomOut, Hand } from "lucide-react"; // Add Hand icon for pan mode

function Settings({ canvas, isSideBarOpen }) {
  const [canvasWidth, setCanvasWidth] = useState("");
  const [canvasHeight, setCanvasHeight] = useState("");
  const [canvasColor, setCanvasColor] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPanning, setIsPanning] = useState(false); // Pan mode state
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

      // Enable canvas panning
      setupCanvasPanning();
    }

    return () => {
      // Cleanup event listeners
      if (canvas) {
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
      }
    };
  }, [canvas]);

  // Setup canvas panning functionality
  const setupCanvasPanning = () => {
    if (!canvas) return;

    canvas.on('mouse:down', (options) => {
      if (isPanning && options.e && canvas.getZoom() > 1) {
        panningRef.current = true;
        canvas.selection = false; // Disable object selection while panning
        canvas.defaultCursor = 'grabbing';
        lastPosXRef.current = options.e.clientX;
        lastPosYRef.current = options.e.clientY;
      }
    });

    canvas.on('mouse:move', (options) => {
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

    canvas.on('mouse:up', () => {
      if (isPanning) {
        panningRef.current = false;
        canvas.defaultCursor = 'grab';
      }
    });
  };

  // Toggle pan mode
  const togglePanMode = () => {
    const newPanningState = !isPanning;
    setIsPanning(newPanningState);
    
    if (canvas) {
      canvas.selection = !newPanningState; // Disable selection when panning
      canvas.defaultCursor = newPanningState ? 'grab' : 'default';
      
      if (!newPanningState) {
        panningRef.current = false;
      }
    }
  };

  // Zoom handlers
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
      
      // Center the viewport after zooming
      centerViewport();
      canvas.renderAll();
    }
  };

  const centerViewport = () => {
    if (canvas) {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const zoom = canvas.getZoom();
      
      // Reset viewport to center
      canvas.viewportTransform[4] = (canvasWidth - canvasWidth * zoom) / 2;
      canvas.viewportTransform[5] = (canvasHeight - canvasHeight * zoom) / 2;
      canvas.setViewportTransform(canvas.viewportTransform);
    }
  };

  const resetZoom = () => {
    setZoomLevel(100);
    applyZoom(100);
    setIsPanning(false); // Exit pan mode when resetting zoom
    
    if (canvas) {
      canvas.selection = true;
      canvas.defaultCursor = 'default';
    }
  };

  // ... rest of your existing handlers remain the same
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

  return (
    <div
      className={`bg-white w-[230px] py-2 transition-all fixed md:right-0 z-99 ${
        isSideBarOpen ? "right-0" : "-right-full"
      }`}
    >
      <section className="px-5">
        <h1 className="font-semibold text-xl">Tool Properties</h1>
      </section>
      
      {/* Zoom Controls */}
      <section className="px-5 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Zoom & Pan</label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{zoomLevel}%</span>
            <button 
              onClick={resetZoom}
              className="text-xs text-blue-600 hover:text-blue-800 px-1"
            >
              Reset
            </button>
          </div>
        </div>
        
        {/* Pan Mode Toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Pan Mode</span>
          <button
            onClick={togglePanMode}
            className={`p-2 rounded-md transition-colors ${
              isPanning 
                ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPanning ? "Disable panning" : "Enable panning (click and drag to move canvas)"}
          >
            <Hand size={16} />
          </button>
        </div>

        {isPanning && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            Pan mode active: Click and drag to move the canvas
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 10}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          
          <div className="flex-1">
            <input
              type="range"
              min="10"
              max="200"
              value={zoomLevel}
              onChange={handleZoomChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>10%</span>
          <span>100%</span>
          <span>200%</span>
        </div>
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