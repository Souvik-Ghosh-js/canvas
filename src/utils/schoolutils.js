import { supabase } from '../supabase/config';

// Get all school images from the 'schools' bucket
export const getSchoolImages = async () => {
  try {
    const { data, error } = await supabase.storage
      .from('schools')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) throw error;

    // Get public URLs for each image
    const schoolsWithUrls = data.map(file => ({
      name: file.name,
      url: supabase.storage.from('schools').getPublicUrl(file.name).data.publicUrl
    }));

    return { success: true, data: schoolsWithUrls };
  } catch (error) {
    console.error('Error fetching school images:', error);
    return { success: false, error: error.message };
  }
};

// Alternative: If you want to store school metadata in a database table
export const getSchoolsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('schools') // Make sure this table exists
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching schools:', error);
    return { success: false, error: error.message };
  }
};