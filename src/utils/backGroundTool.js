import { FabricImage } from "fabric";

export const addBG = async (canvas, url) => {
  try {
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();

    const img = await FabricImage.fromURL(url, {
      crossOrigin: "anonymous",
    });

    // Your own pre-scaling to reduce extreme stretch
    const iw = img.width;
    const ih = img.height;

    // Basic stretch scaling
    img.scaleX = 0.3928;
    img.scaleY = 0.3614;

    // Now let Fabric finalize the stretch cleanly
    canvas.backgroundImage = img;
    canvas.backgroundImageStretch = true;

    canvas.requestRenderAll();
  } catch (err) {
    console.error("Error loading BG:", err);
  }
};
