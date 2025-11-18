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
  activePage, // Add this parameter
}) => {
  if (!canvas) return;

  // First, save the current page state
  const updatedCanvasList = canvasList.map(page => {
    if (page.id === activePage) {
      return { ...page, json: canvas.toJSON() };
    }
    return page;
  });

  const id = Date.now();
  const json = {
    version: "6.7.1",
    background: "#ffffff",
  };

  const newCanvasList = [
    ...updatedCanvasList,
    {
      id,
      json,
    },
  ];

  setCanvasList(newCanvasList);
  setActivePage(id);

  // Clear and set up new page
  canvas.clear();
  canvas.loadFromJSON(json).then(() => {
    canvas.requestRenderAll();
  });

  return id;
};

// Duplicate existing page
export const duplicateCurrentPage = ({
  canvas,
  canvasList,
  setCanvasList,
  setActivePage,
  activePage,
}) => {
  if (!canvas || !activePage) return;

  // First, save the current page state
  const updatedCanvasList = canvasList.map(page => {
    if (page.id === activePage) {
      return { ...page, json: canvas.toJSON() };
    }
    return page;
  });

  const currentPage = canvasList.find(page => page.id === activePage);
  const id = Date.now();

  const newCanvasList = [
    ...updatedCanvasList,
    { 
      id, 
      json: currentPage?.json || {
        version: "6.7.1",
        background: "#ffffff",
      }
    },
  ];

  setCanvasList(newCanvasList);
  setActivePage(id);

  // Load the duplicated content
  canvas.loadFromJSON(currentPage?.json || {
    version: "6.7.1",
    background: "#ffffff",
  }).then(() => {
    canvas.requestRenderAll();
  });

  return id;
};

// Load a page JSON into the canvas
export const loadPageToCanvas = ({ canvas, json, pageDefaults = {} }) => {
  if (!canvas) return;

  canvas.clear();

  if (json) {
    canvas.loadFromJSON(json).then(() => {
      canvas.requestRenderAll();
    });
  } else {
    // Set up blank page with defaults
    const { width = 300, height = 425, backgroundColor = "#ffffff" } = pageDefaults;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.backgroundColor = backgroundColor;
    canvas.requestRenderAll();
  }
};

// Delete active page - FIXED VERSION
export const deletePage = ({
  canvas,
  canvasList,
  activePage,
  setCanvasList,
  setActivePage,
}) => {
  if (!canvas || !activePage) return;

  // Save current page state before deletion
  const updatedList = canvasList.map(page => 
    page.id === activePage ? { ...page, json: canvas.toJSON() } : page
  ).filter((page) => page.id !== activePage);

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
    // Load the first page (or you can choose to load the previous page)
    const nextPage = updatedList[0];
    setCanvasList(updatedList);
    setActivePage(nextPage.id);

    canvas.loadFromJSON(nextPage.json).then(() => {
      canvas.requestRenderAll();
    });
  }
};