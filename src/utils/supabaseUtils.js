import { supabase } from '../supabase/config';

// Generate a simple MAC ID (for demo purposes - in production, use a proper device ID)
export const getMacId = () => {
  let macId = localStorage.getItem('macId');
  if (!macId) {
    macId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('macId', macId);
  }
  return macId;
};


// Save project to Supabase
export const saveProjectToSupabase = async (projectName, canvasJson, macId) => {
  try {
    // Convert canvas JSON to blob for storage
    const canvasBlob = new Blob([JSON.stringify(canvasJson)], { 
      type: 'application/json' 
    });
    
    const fileName = `project_${Date.now()}.json`;
    const filePath = `${macId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('projects')
      .upload(filePath, canvasBlob);

    if (storageError) throw storageError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('projects')
      .getPublicUrl(filePath);

    // Save project metadata to database
    const { data, error } = await supabase
      .from('user_projects')
      .insert([
        {
          mac_id: macId,
          project_name: projectName,
          file_url: urlData.publicUrl,
          file_path: filePath,
          created_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error saving project:', error);
    return { success: false, error: error.message };
  }
};

// Get all projects for a MAC ID
export const getProjectsByMacId = async (macId) => {
  try {
    const { data, error } = await supabase
      .from('user_projects')
      .select('*')
      .eq('mac_id', macId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, error: error.message };
  }
};

// Load project data from storage
export const loadProjectFromSupabase = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from('projects')
      .download(filePath);

    if (error) throw error;

    const jsonData = await data.text();
    return { success: true, data: JSON.parse(jsonData) };
  } catch (error) {
    console.error('Error loading project:', error);
    return { success: false, error: error.message };
  }
};

// Delete project
export const deleteProjectFromSupabase = async (projectId, filePath) => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('projects')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('user_projects')
      .delete()
      .eq('id', projectId);

    if (dbError) throw dbError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message };
  }
};