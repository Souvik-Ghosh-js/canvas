export const bringForward = (canvas) => {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.bringObjectForward(active);
    canvas.requestRenderAll();
  }
};

export const sendBackward = (canvas) => {
  const active = canvas.getActiveObject();
  if (active) {
    canvas.sendObjectBackwards(active);
    canvas.requestRenderAll();
  }
};
