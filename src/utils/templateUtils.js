import { supabase } from "../supabase/config"; // Adjust the import path

export const getTemplatesFromBucket = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('templates')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      throw error;
    }

    // Get public URLs for each template
    const templates = await Promise.all(
      data.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('templates')
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: urlData.publicUrl,
        };
      })
    );

    return { success: true, templates };
  } catch (error) {
    console.error('Error fetching templates:', error);
    return { success: false, error: error.message };
  }
};

export const applyTemplateToCanvas = (canvas, templateUrl) => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(templateUrl, (img) => {
      if (!img) {
        reject(new Error('Failed to load template image'));
        return;
      }

      // Clear the canvas first
      canvas.clear();

      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      img.scaleToWidth(canvasWidth);
      if (img.getScaledHeight() > canvasHeight) {
        img.scaleToHeight(canvasHeight);
      }

      // Center the image
      img.set({
        left: (canvasWidth - img.getScaledWidth()) / 2,
        top: (canvasHeight - img.getScaledHeight()) / 2,
        selectable: false,
        evented: false,
        name: 'template_background'
      });

      canvas.add(img);
      canvas.renderAll();
      resolve();
    });
  });
};