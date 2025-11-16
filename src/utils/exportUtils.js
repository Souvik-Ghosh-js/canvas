import { saveProjectToSupabase, getMacId } from '../utils/supabaseUtils.js';




export const exportAsPNG = (canvas) => {
  const fileName = prompt("Enter file name:") || "canvas";
  const dataURL = canvas.toDataURL({
    format: "png",
    quality: 1.0,
    multiplier: 4,
  });

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = fileName + ".png";
  link.click();
};


// Updated save function
export const saveCanvasState = async (canvas, projectName = null) => {
  if (!projectName) {
    projectName = prompt('Enter a name for your project:');
    if (!projectName) return;
  }

  const macId = getMacId();
  const canvasJson = canvas.toJSON();
  
  const result = await saveProjectToSupabase(projectName, canvasJson, macId);
  
  if (result.success) {
    alert('Project saved successfully!');
    return result.data;
  } else {
    alert('Error saving project: ' + result.error);
    return null;
  }
};

export const handleFileOpen = async (canvas, onProjectsLoaded) => {
  const macId = getMacId();
  const result = await getProjectsByMacId(macId);
  
  if (result.success && onProjectsLoaded) {
    onProjectsLoaded(result.data);
  } else if (!result.success) {
    alert('Error loading projects: ' + result.error);
  }
};
