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
  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = new Canvas(canvasRef.current, {
      preserveObjectStacking: true,
    });

    initCanvas.setWidth(designSize.width);
    initCanvas.setHeight(designSize.height);
    initCanvas.backgroundColor = "#ffffff";
    initCanvas.renderAll();

    // ---------------- ALIGNMENT GUIDES ----------------

    const centerTolerance = 6;

    let verticalLine = null;
    let horizontalLine = null;

    const drawGuide = (ctx, x1, y1, x2, y2) => {
      ctx.save();
      ctx.strokeStyle = "#3b82f6"; // blue
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]); // dotted
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    initCanvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;

      const canvasCenterX = initCanvas.getWidth() / 2;
      const canvasCenterY = initCanvas.getHeight() / 2;

      const objCenter = obj.getCenterPoint();

      verticalLine = null;
      horizontalLine = null;

      // Only detect — do NOT snap
      if (Math.abs(objCenter.x - canvasCenterX) < centerTolerance) {
        verticalLine = canvasCenterX;
      }

      if (Math.abs(objCenter.y - canvasCenterY) < centerTolerance) {
        horizontalLine = canvasCenterY;
      }

      initCanvas.requestRenderAll();
    });

    // Proper clearing before each render
    initCanvas.on("before:render", () => {
      initCanvas.clearContext(initCanvas.contextTop);
    });

    initCanvas.on("after:render", () => {
      const ctx = initCanvas.contextTop;

      if (verticalLine !== null) {
        drawGuide(
          ctx,
          verticalLine,
          0,
          verticalLine,
          initCanvas.getHeight()
        );
      }

      if (horizontalLine !== null) {
        drawGuide(
          ctx,
          0,
          horizontalLine,
          initCanvas.getWidth(),
          horizontalLine
        );
      }
    });

    initCanvas.on("mouse:up", () => {
      verticalLine = null;
      horizontalLine = null;
      initCanvas.requestRenderAll();
    });

    // --------------------------------------------------

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
