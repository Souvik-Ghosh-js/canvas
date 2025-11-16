// hooks/useFabricCanvas.js
import { useEffect, useRef, useState } from "react";
import { Canvas } from "fabric";

export default function useFabricCanvas() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [designSize, setDesignSize] = useState({ width: 600, height: 800 });

  // 🔥 Detect Device & Set Size
  const detectDeviceSize = () => {
    const width = window.innerWidth;

    if (width < 480) {
      // 📱 Mobile
      return { width: 300, height: 450 };
    } else if (width < 1024) {
      // 📲 Tablet
      return { width: 450, height: 600 };
    } else {
      // 💻 Desktop
      return { width: 400, height: 550 };
    }
  };

  useEffect(() => {
    setDesignSize(detectDeviceSize());
  }, []);

  // Initialize Fabric Canvas
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

    resizeCanvas(initCanvas, designSize);

    const handleResize = () => {
      const newSize = detectDeviceSize();
      setDesignSize(newSize); // update state
      resizeCanvas(initCanvas, newSize);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      initCanvas.dispose();
    };
  }, [designSize.width, designSize.height]);

  return { canvasRef, canvas, designSize };
}

// 🔥 Resize canvas for container width + scale objects
function resizeCanvas(canvas, designSize) {
  const wrapper = canvas.getElement().parentNode;
  if (!wrapper) return;

  const containerWidth = wrapper.offsetWidth;

  const scale = containerWidth / designSize.width;
  const newWidth = designSize.width * scale;
  const newHeight = designSize.height * scale;

  canvas.setWidth(newWidth);
  canvas.setHeight(newHeight);

  canvas.renderAll();
}
