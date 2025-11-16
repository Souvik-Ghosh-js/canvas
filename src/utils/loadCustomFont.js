export const loadCustomFont = async (fontFamily) => {
  try {
    await document.fonts.load(`16px "${fontFamily}"`);
    console.log(`Font "${fontFamily}" loaded`);
  } catch (err) {
    console.error("Error loading font:", err);
  }
};
