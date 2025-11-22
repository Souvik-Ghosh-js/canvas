import { supabase } from '../supabase/config';
// Upload canvas as image to separate images bucket (no database entry)
export const uploadCanvasToImagesBucket = async (canvas, fileName = 'design') => {
  try {
    // Method 1: Using Fabric.js built-in high-quality export
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1.0, // Maximum quality
      multiplier: 2, // 2x resolution for retina/high DPI
      enableRetinaScaling: true
    });

    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    // Generate unique file name
    const timestamp = new Date().getTime();
    const uniqueFileName = `${fileName}_${timestamp}.png`;

    // Upload to Supabase images bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(uniqueFileName, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(uniqueFileName);

    return { success: true, imageUrl: publicUrl };
  } catch (error) {
    console.error('Error uploading image to images bucket:', error);
    return { success: false, error: error.message };
  }
};

// Optional: Clean up old images after some time
export const deleteImageFromBucket = async (fileName) => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([fileName]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error.message };
  }
};


// Add this function to your imageUploadUtils.js or create a new file
export const uploadJsonToBucket = async (jsonData, fileName) => {
  try {
    
    // Convert JSON to Blob
    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { 
      type: 'application/json' 
    });
    
    const filePath = `jsons/${fileName}_${Date.now()}.json`;
    
    const { data, error } = await supabase.storage
      .from('images') // Using same bucket, you can create a separate one for JSONs
      .upload(filePath, jsonBlob, {
        contentType: 'application/json',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return {
      success: true,
      jsonUrl: urlData.publicUrl,
      filePath: filePath
    };
  } catch (error) {
    console.error('Error uploading JSON:', error);
    return {
      success: false,
      error: error.message
    };
  }
};