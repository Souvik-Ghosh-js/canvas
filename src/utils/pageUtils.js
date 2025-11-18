// utils/pageUtils.js
// Fabric.js v6 helpers for managing multi-page JSON

// Initialize a blank page with a default background
export const initBlankCanvas = (
  canvas,
  { width = 300, height = 425, backgroundColor = "#ffffff" } = {}
) => {
  if (!canvas) return;

  canvas.setWidth(width);
  canvas.setHeight(height);

  canvas.backgroundColor = backgroundColor;
  canvas.requestRenderAll();
};

// Create a fresh empty page
export const createNewPage = ({
  canvas,
  canvasList,
  setCanvasList,
  setActivePage,
}) => {
  const id = Date.now();
  const json = {
    version: "6.7.1",
    background: "#ffffff",
  };

  setCanvasList([
    ...canvasList,
    {
      id,
      json,
    },
  ]);

  setActivePage(id);

  canvas.loadFromJSON(json).then(() => {
    canvas.requestRenderAll();
  });
};

// Duplicate existing page
export const duplicateCurrentPage = ({
  canvas,
  canvasList,
  setCanvasList,
  setActivePage,
}) => {
  if (!canvas) return;

  const json = canvas.toJSON();
  const id = Date.now();

  setCanvasList([...canvasList, { id, json }]);
  setActivePage(id);

  canvas.loadFromJSON(json).then(() => {
    canvas.requestRenderAll();
  });
};

// Load a page JSON into the canvas
export const loadPageToCanvas = ({ canvas, json }) => {
  if (!canvas) return;
  if (!json) return;

  canvas.loadFromJSON(json).then(() => {
    canvas.requestRenderAll();
  });
};

// Delete active page
export const deletePage = ({
  canvas,
  canvasList,
  activePage,
  setCanvasList,
  setActivePage,
}) => {
  if (!canvas || !activePage) return;

  const updatedList = canvasList.filter((page) => page.id !== activePage);

  if (updatedList.length === 0) {
    // Create new blank page if all deleted
    const newId = Date.now();
    const blankPage = {
      id: newId,
      json: {
        version: "6.7.1",
        background: "#ffffff",
      },
    };

    setCanvasList([blankPage]);
    setActivePage(newId);

    canvas.loadFromJSON(blankPage.json).then(() => {
      canvas.requestRenderAll();
    });
  } else {
    // Load last page
    const nextPage = updatedList[updatedList.length - 1];
    setCanvasList(updatedList);
    setActivePage(nextPage.id);

    canvas.loadFromJSON(nextPage.json).then(() => {
      canvas.requestRenderAll();
    });
  }
};
