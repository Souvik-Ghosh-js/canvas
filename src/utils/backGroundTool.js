// utils/imageTools.js
import { FabricImage } from "fabric";

export const addBG = async (canvas, url) => {
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  // 1. Calculate the necessary scale factors
  try {
    const img = await FabricImage.fromURL(
      url,
      { crossOrigin: "anonymous" } // still needed for CORS
    );
    const scaleX = canvasWidth / img.width;
    const scaleY = canvasHeight / img.height;
    img.set({
      scaleX: scaleX,
      scaleY: scaleY,
    });
    canvas.backgroundImage = img;
    canvas.requestRenderAll();
  } catch (err) {
    console.error("Error loading image:", err);
  }
};
