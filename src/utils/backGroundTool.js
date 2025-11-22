// utils/backGroundTool.js
import { FabricImage } from "fabric";

export const addBG = async (canvas, url, allPages = []) => {
  try {
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();

    const img = await FabricImage.fromURL(url, {
      crossOrigin: "anonymous",
    });

    // Check if any page has templates
    const hasTemplatesInAnyPage = checkForTemplatesInPages(canvas, allPages);

    if (hasTemplatesInAnyPage) {
      // Apply template scaling
      console.log('Template detected - applying template scaling');
      applyTemplateScaling(canvas, img, cw, ch);
    } else {
      // Apply regular scaling
      console.log('No templates found - applying regular scaling');
      applyRegularScaling(canvas, img, cw, ch);
    }

    canvas.requestRenderAll();
  } catch (err) {
    console.error("Error loading BG:", err);
  }
};

// Check for templates in current canvas and all pages
const checkForTemplatesInPages = (currentCanvas, allPages = []) => {
  // Check current canvas first
  if (currentCanvas.hasTemplates || currentCanvas.isTemplateCanvas) {
    console.log('Template found in current canvas flags');
    return true;
  }

  // Check current canvas objects
  const currentCanvasObjects = currentCanvas.getObjects();
  const hasTemplateObjects = currentCanvasObjects.some(obj => 
    obj.isTemplate || obj.isTemplateElement || obj.templateType
  );

  if (hasTemplateObjects) {
    console.log('Template found in current canvas objects');
    return true;
  }

  // Check all other pages for templates
  for (const page of allPages) {
    if (page.canvas) {
      const pageCanvas = page.canvas;
      
      // Check page canvas flags
      if (pageCanvas.hasTemplates || pageCanvas.isTemplateCanvas) {
        console.log('Template found in page canvas flags');
        return true;
      }

      // Check page canvas objects
      const pageObjects = pageCanvas.getObjects();
      const pageHasTemplates = pageObjects.some(obj => 
        obj.isTemplate || obj.isTemplateElement || obj.templateType
      );

      if (pageHasTemplates) {
        console.log('Template found in page objects');
        return true;
      }
    } else if (page.json) {
      // Check page JSON data for template markers
      const pageHasTemplates = checkJsonForTemplates(page.json);
      if (pageHasTemplates) {
        console.log('Template found in page JSON data');
        return true;
      }
    }
  }

  console.log('No templates found in any page');
  return false;
};

// Check JSON data for template markers
const checkJsonForTemplates = (jsonData) => {
  if (!jsonData) return false;
  
  // Check canvas-level template flags
  if (jsonData.hasTemplates || jsonData.isTemplateCanvas) {
    return true;
  }
  
  // Check objects in JSON for template properties
  if (jsonData.objects && Array.isArray(jsonData.objects)) {
    return jsonData.objects.some(obj => 
      obj.isTemplate || obj.isTemplateElement || obj.templateType
    );
  }
  
  return false;
};

// Scaling for templates - use fixed scaling factors
const applyTemplateScaling = (canvas, img, canvasWidth, canvasHeight) => {
  const iw = img.width;
  const ih = img.height;

  // Use your predefined scaling factors for templates
  img.set({
    scaleX: 0.3928,
    scaleY: 0.3614,
    originX: 'left',
    originY: 'top'
  });

  canvas.backgroundImage = img;
  canvas.backgroundImageStretch = true;
};

// Regular scaling - use aspect ratio calculation
const applyRegularScaling = (canvas, img, canvasWidth, canvasHeight) => {
  const iw = img.width;
  const ih = img.height;

  // Calculate the necessary scale factors
  const scaleX = canvasWidth / iw;
  const scaleY = canvasHeight / ih;
  
  img.set({
    scaleX: scaleX,
    scaleY: scaleY,
    originX: 'left',
    originY: 'top'
  });

  canvas.backgroundImage = img;
  canvas.backgroundImageStretch = false;
};