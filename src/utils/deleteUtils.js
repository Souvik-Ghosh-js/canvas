// Update your deleteActiveObject function
export const deleteActiveObject = (e, canvas) => {
  if (!canvas) return;
  
  const activeObject = canvas.getActiveObject();
  
  if (!activeObject) return;
  
  // Check if it's a text object in editing mode
  if (activeObject.isEditing && activeObject.type === 'textbox') {
    // Let Fabric.js handle character deletion in editing mode
    return; // Don't prevent default, let browser handle it
  }
  
  // For non-editing objects or non-text objects, use normal deletion
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    canvas.remove(activeObject);
    canvas.requestRenderAll();
  }
};

export const handleDelete = (canvas) => {
  const activeObjects = canvas.getActiveObjects();
  if (activeObjects.length > 0) {
    activeObjects.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }
};
