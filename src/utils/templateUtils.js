import { supabase } from "../supabase/config";

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

    // Get public URLs and metadata for each template
    const templates = await Promise.all(
      data.map(async (file) => {
        try {
          const { data: urlData } = supabase.storage
            .from('templates')
            .getPublicUrl(file.name);

          // Extract metadata from filename
          const metadata = extractMetadataFromFileName(file.name);

          // Determine template type and get preview data
          let templateData = {
            name: file.name,
            url: urlData.publicUrl,
            displayName: metadata.name,
            category: metadata.category,
            description: metadata.description,
            type: getFileType(file.name),
            size: file.metadata?.size || 0,
            createdAt: file.created_at
          };

          // For JSON templates, try to load and parse the data
          // In getTemplatesFromBucket function, update the JSON parsing part:
          if (file.name.endsWith('.json')) {
            try {
              const response = await fetch(urlData.publicUrl);
              if (response.ok) {
                const jsonData = await response.json();
                templateData.jsonData = jsonData;

                // Extract preview image from all three structures
                if (jsonData.backgroundImage) {
                  // Standard Fabric.js structure
                  templateData.previewUrl = jsonData.backgroundImage;
                } else if (jsonData.canvasData?.backgroundImage) {
                  // Custom wrapper structure
                  templateData.previewUrl = jsonData.canvasData.backgroundImage;
                } else if (jsonData.pages?.[0]?.json?.backgroundImage) {
                  // Multi-page structure
                  templateData.previewUrl = jsonData.pages[0].json.backgroundImage;
                }
              }
            } catch (e) {
              console.warn('Could not parse JSON template:', file.name, e);
            }
          } else if (file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            // For image files, use the URL directly as preview
            templateData.previewUrl = urlData.publicUrl;
          }

          return templateData;
        } catch (fileError) {
          console.error('Error processing file:', file.name, fileError);
          return null;
        }
      })
    );

    // Filter out null values
    const validTemplates = templates.filter(template => template !== null);

    return { success: true, templates: validTemplates };
  } catch (error) {
    console.error('Error fetching templates:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to get file type
const getFileType = (fileName) => {
  if (fileName.endsWith('.json')) return 'application/json';
  if (fileName.match(/\.(jpg|jpeg)$/i)) return 'image/jpeg';
  if (fileName.endsWith('.png')) return 'image/png';
  if (fileName.endsWith('.webp')) return 'image/webp';
  if (fileName.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
};

// Helper function to extract metadata from filename
const extractMetadataFromFileName = (fileName) => {
  const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const parts = withoutExtension.split('_');

  return {
    category: parts[0] || 'Other',
    name: parts[1] ? parts[1].replace(/-/g, ' ') : withoutExtension,
    description: parts[2] ? parts[2].replace(/-/g, ' ') : 'No description'
  };
};

export const applyTemplateToCanvas = async (canvas, template) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting template application for:', template.name);

      if (template.type === 'application/json' && template.jsonData) {
        // Handle JSON template (Fabric.js format)
        await applyJsonTemplateToCanvas(canvas, template.jsonData);
      } else if (template.previewUrl) {
        // Handle image template
        await applyImageTemplateToCanvas(canvas, template.previewUrl);
      } else {
        // Fallback: try to load from URL
        await applyImageTemplateToCanvas(canvas, template.url);
      }

      // Final re-render to ensure everything is visible
      canvas.renderAll();
      
      // Force a canvas refresh
      canvas.requestRenderAll();
      
      console.log('Template application completed');
      resolve();
    } catch (error) {
      console.error('Error applying template:', error);
      reject(error);
    }
  });
};

const applyJsonTemplateToCanvas = (canvas, jsonData) => {
  return new Promise((resolve, reject) => {
    try {
      // Handle all three JSON structures
      let templateData;
      
      if (jsonData.pages && jsonData.pages.length > 0 && jsonData.pages[0].json) {
        // Structure 3: Multi-page format - use first page's json
        console.log('Applying multi-page template, using first page');
        templateData = jsonData.pages[0].json;
      } else if (jsonData.canvasData) {
        // Structure 2: Custom wrapper format
        console.log('Applying canvasData template');
        templateData = jsonData.canvasData;
      } else {
        // Structure 1: Standard Fabric.js format
        console.log('Applying standard Fabric.js template');
        templateData = jsonData;
      }
      
      // Validate that we have valid template data
      if (!templateData || (!templateData.objects && !templateData.background && !templateData.backgroundImage)) {
        throw new Error('Invalid template structure: No canvas data found');
      }

      console.log('Template data to load:', {
        objectsCount: templateData.objects?.length || 0,
        hasBackground: !!templateData.background,
        hasBackgroundImage: !!templateData.backgroundImage,
        width: templateData.width,
        height: templateData.height
      });

      // Clear the canvas first
      canvas.clear();
      
      // Load the JSON template into the canvas
      canvas.loadFromJSON(templateData, () => {
        // Set canvas dimensions from template if available
        if (templateData.width && templateData.height) {
          canvas.setWidth(templateData.width);
          canvas.setHeight(templateData.height);
        }

        console.log('Template applied successfully');
        
        // Force multiple re-renders to ensure everything is visible
        canvas.renderAll();
        
        // Additional re-render after a small delay to catch any async rendering issues
        setTimeout(() => {
          canvas.renderAll();
        }, 50);
        
        // One more render for good measure
        requestAnimationFrame(() => {
          canvas.renderAll();
          resolve();
        });
      }, (error) => {
        console.error('Error in canvas.loadFromJSON callback:', error);
        reject(error);
      });
    } catch (error) {
      console.error('Error in applyJsonTemplateToCanvas:', error);
      reject(error);
    }
  });
};


const applyImageTemplateToCanvas = (canvas, imageUrl) => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(imageUrl, (img) => {
      if (!img) {
        reject(new Error('Failed to load template image'));
        return;
      }

      // Set canvas dimensions to match image
      canvas.setWidth(img.width || 800);
      canvas.setHeight(img.height || 600);

      // Add image as background
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        name: 'template_background'
      });

      canvas.add(img);
      canvas.renderAll();
      resolve();
    }, { crossOrigin: 'anonymous' }); // Add crossOrigin for CORS issues
  });
};

// Helper function to create thumbnail for JSON templates
export const createTemplateThumbnail = async (template) => {
  try {
    if (template.previewUrl) {
      // For templates with preview images, use them directly
      return template.previewUrl;
    }

    if (template.type === 'application/json' && template.jsonData) {
      // Create a thumbnail canvas for JSON templates
      return await createJsonTemplateThumbnail(template.jsonData);
    }

    return null;
  } catch (error) {
    console.error('Error creating template thumbnail:', error);
    return null;
  }
};

const createJsonTemplateThumbnail = async (jsonData) => {
  return new Promise(async (resolve) => {
    try {
      // Check if fabric is available
      if (typeof window === 'undefined' || !window.fabric) {
        resolve(null);
        return;
      }

      const canvasElement = document.createElement('canvas');
      const canvas = new fabric.Canvas(canvasElement, {
        width: 200,
        height: 150,
        backgroundColor: '#f8f9fa'
      });

      // Handle all three JSON structures
      let templateData;
      
      if (jsonData.pages && jsonData.pages.length > 0 && jsonData.pages[0].json) {
        templateData = jsonData.pages[0].json;
      } else if (jsonData.canvasData) {
        templateData = jsonData.canvasData;
      } else {
        templateData = jsonData;
      }

      // Check if we have valid data to load
      if (!templateData || (!templateData.objects && !templateData.background && !templateData.backgroundImage)) {
        console.warn('No valid template data for thumbnail');
        canvas.dispose();
        resolve(null);
        return;
      }

      // Load the JSON template
      canvas.loadFromJSON(templateData, () => {
        try {
          // Scale to fit thumbnail
          const originalWidth = templateData.width || 800;
          const originalHeight = templateData.height || 600;
          const scale = Math.min(200 / originalWidth, 150 / originalHeight) * 0.8;

          canvas.setZoom(scale);
          canvas.renderAll();

          // Convert to data URL for thumbnail
          const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 0.7
          });

          canvas.dispose();
          resolve(dataUrl);
        } catch (renderError) {
          console.error('Error rendering thumbnail:', renderError);
          canvas.dispose();
          resolve(null);
        }
      }, (error) => {
        console.error('Error loading JSON for thumbnail:', error);
        canvas.dispose();
        resolve(null);
      });
    } catch (error) {
      console.error('Error creating JSON thumbnail:', error);
      resolve(null);
    }
  });
};