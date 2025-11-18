// hooks/useFabricCanvas.js
import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";

export default function useFabricCanvas() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  // Default logical page size (not scaled)
  const [designSize, setDesignSize] = useState({ width: 400, height: 550 });

  // Zoom control
  const [zoom, setZoom] = useState(1);

  // Detect device to set base canvas size
  const detectDeviceSize = () => {
    const width = window.innerWidth;

    if (width < 480) {
      // Mobile
      return { width: 300, height: 450 };
    } else if (width < 1024) {
      // Tablet
      return { width: 450, height: 600 };
    } else {
      // Desktop
      return { width: 400, height: 550 };
    }
  };

  // Set initial size
  useEffect(() => {
    setDesignSize(detectDeviceSize());
  }, []);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = new Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });

    initCanvas.setWidth(designSize.width);
    initCanvas.setHeight(designSize.height);
    initCanvas.backgroundColor = "#ffffff";
    initCanvas.renderAll();

    setCanvas(initCanvas);

    return () => {
      initCanvas.dispose();
    };
  }, [designSize.width, designSize.height]);

  // --------------- 🔥 ZOOM HANDLER -----------------
  const setCanvasZoom = (value) => {
    if (!canvas) return;

    setZoom(value);

    // Set Fabric logical zoom
    canvas.setZoom(value);

    // Scale canvas display dimensions
    canvas.setWidth(designSize.width * value);
    canvas.setHeight(designSize.height * value);

    canvas.requestRenderAll();
  };
  // ------------------------------------------------------

  return { canvasRef, canvas, designSize, zoom, setCanvasZoom };
}
