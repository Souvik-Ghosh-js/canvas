import { supabase } from '../supabase/config';
// Upload canvas as image to separate images bucket (no database entry)
export const uploadCanvasToImagesBucket = async (canvas, fileName = 'design') => {
  try {
    // Convert canvas to data URL
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 0.9,
    });

    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    // Generate unique file name
    const timestamp = new Date().getTime();
    const uniqueFileName = `${fileName}_${timestamp}.png`;

    // Upload to Supabase images bucket (no database entry)
    const { data, error } = await supabase.storage
      .from('images') // Separate bucket
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