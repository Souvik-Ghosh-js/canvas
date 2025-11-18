// utils/imageTools.js
import { FabricImage } from "fabric";

export const addElement = async (canvas, url) => {
  try {
    const img = await FabricImage.fromURL(
      url,
      { crossOrigin: "anonymous" } // still needed for CORS
    );

    img.set({
      left: 100,
      top: 100,
      scaleX: 0.2,
      scaleY: 0.2,
    });
    img.isImage = true;
    canvas.add(img);
    canvas.renderAll();
  } catch (err) {
    console.error("Error loading image:", err);
  }
};
