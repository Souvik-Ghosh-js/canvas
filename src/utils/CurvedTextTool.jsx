// utils/curvedText.js
import { Group, Textbox } from "fabric";

// ==================== CONSTANTS ====================
export const CURVE_STYLES = {
  ARCH: "arch",
  CIRCLE: "circle",
  WAVE: "wave",
  INVERTED_ARCH: "inverted-arch",
  SPIRAL: "spiral",
  RAINBOW: "rainbow",
  FLAG: "flag"
};

const FONTS = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Monospace",
  "Cursive",
  "Fantasy"
];

// ==================== MAIN EXPORT FUNCTION ====================
export const addCurvedText = (canvas, options = {}) => {
  const {
    text = "Curved Text",
    curveStyle = CURVE_STYLES.ARCH,
    fontSize = 40,
    fontFamily = "Arial",
    fontWeight = "normal",
    fontStyle = "normal",
    underline = false,
    linethrough = false,
    color = "#333333",
    borderColor = "#000000",
    borderWidth = 0,
    radius = 200,
    amplitude = 60,
    letterSpacing = 0,
    reverse = false,
    curveIntensity = 1,
    removeExisting = true
  } = options;

  if (!canvas || !text) return;

  const centerX = canvas.getWidth() / 2;
  const centerY = canvas.getHeight() / 2;

  // Only remove existing curved text if explicitly told to
  if (removeExisting) {
    const existingGroup = canvas
      .getObjects()
      .find((o) => o.customType === "curvedText");
    if (existingGroup) canvas.remove(existingGroup);
  }

  let letters = [];

  // Create text based on selected style
  switch (curveStyle) {
    case CURVE_STYLES.ARCH:
      letters = createArchText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius, letterSpacing, reverse);
      break;
    case CURVE_STYLES.CIRCLE:
      letters = createCircleText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius, letterSpacing, reverse);
      break;
    case CURVE_STYLES.WAVE:
      letters = createWaveText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, amplitude, letterSpacing, reverse);
      break;
    case CURVE_STYLES.INVERTED_ARCH:
      letters = createInvertedArchText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius, letterSpacing, reverse);
      break;
    case CURVE_STYLES.SPIRAL:
      letters = createSpiralText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius, curveIntensity, letterSpacing, reverse);
      break;
    case CURVE_STYLES.RAINBOW:
      letters = createRainbowText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, radius, letterSpacing, reverse);
      break;
    case CURVE_STYLES.FLAG:
      letters = createFlagText(text, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, amplitude, letterSpacing, reverse);
      break;
  }

  const group = new Group(letters, {
    originX: "center",
    originY: "center",
    left: centerX,
    top: centerY,
    selectable: true,
    evented: true,
    subTargetCheck: true,
  });
  
  // Store all styling properties on the group
  group.customType = "curvedText";
  group.curveStyle = curveStyle;
  group.originalText = text;
  group.fontSize = fontSize;
  group.fontFamily = fontFamily;
  group.fontWeight = fontWeight;
  group.fontStyle = fontStyle;
  group.underline = underline;
  group.linethrough = linethrough;
  group.textColor = color;
  group.borderColor = borderColor;
  group.borderWidth = borderWidth;
  group.radius = radius;
  group.amplitude = amplitude;
  group.letterSpacing = letterSpacing;
  group.reverse = reverse;
  group.curveIntensity = curveIntensity;

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();

  // Setup interaction handlers
  setupGroupInteractions(canvas, group);
  
  return group;
};

// ==================== CURVE CREATION FUNCTIONS ====================

export const createArchText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius = 200, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const arcLength = Math.PI;
  const startAngle = -Math.PI / 2 - arcLength / 2;
  const step = arcLength / (str.length - 1 || 1);
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI + 90;

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};

export const createCircleText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius = 180, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const startAngle = 0;
  const step = (Math.PI * 2) / str.length;
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI + 90;

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};

export const createWaveText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, amplitude = 60, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const period = 2 * Math.PI / (str.length - 1 || 1) * 2;
  const totalWidth = fontSize * 0.8 * str.length;
  const startX = centerX - totalWidth / 2 + fontSize / 2;
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const x = startX + i * fontSize * 0.8 * (1 + letterSpacing);
    const y = centerY + amplitude * Math.sin(i * period);
    const slope = amplitude * period * Math.cos(i * period);
    const textAngle = Math.atan(slope / (fontSize * 0.8)) * 180 / Math.PI;

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};

export const createInvertedArchText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius = 200, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const arcLength = Math.PI;
  const startAngle = Math.PI / 2 - arcLength / 2;
  const step = arcLength / (str.length - 1 || 1);
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI - 90;

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};

export const createSpiralText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius = 150, intensity = 1, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const totalAngle = Math.PI * 4;
  const step = totalAngle / (str.length - 1 || 1);
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const angle = i * step;
    const spiralRadius = radius + (i * intensity * 5);
    const x = centerX + spiralRadius * Math.cos(angle);
    const y = centerY + spiralRadius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI + 90;

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};

export const createRainbowText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, radius = 200, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8F00FF'];
  const arcLength = Math.PI * 1.5;
  const startAngle = -Math.PI / 2 - arcLength / 2;
  const step = arcLength / (str.length - 1 || 1);
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI + 90;
    const rainbowColor = rainbowColors[i % rainbowColors.length];

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, rainbowColor, '#000000', 0, letterSpacing));
  });
  return letters;
};

export const createFlagText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, amplitude = 50, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const totalWidth = fontSize * 0.8 * str.length;
  const startX = centerX - totalWidth / 2 + fontSize / 2;
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const x = startX + i * fontSize * 0.8 * (1 + letterSpacing);
    const y = centerY + amplitude * Math.sin(i * Math.PI / 1.5);
    const slope = amplitude * (Math.PI / 1.5) * Math.cos(i * Math.PI / 1.5);
    const textAngle = Math.atan(slope / (fontSize * 0.8)) * 180 / Math.PI;

    letters.push(createLetterObject(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};

// ==================== HELPER FUNCTIONS ====================

// Renamed from createLetter to createLetterObject to avoid conflict
function createLetterObject(char, x, y, angle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, fillColor, strokeColor, strokeWidth, letterSpacing) {
  return new Textbox(char, {
    left: x,
    top: y,
    originX: "center",
    originY: "center",
    angle: angle,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    fontFamily: fontFamily,
    underline: underline,
    linethrough: linethrough,
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: strokeWidth,
    strokeUniform: true,
    charSpacing: letterSpacing * 1000,
    selectable: true,
    evented: true,
    hasControls: false,
    hasBorders: false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    borderColor: "rgba(0,0,0,0.3)",
    cornerColor: "rgba(0,0,0,0.5)",
  });
}

// ==================== INTERACTION HANDLERS ====================

function setupGroupInteractions(canvas, group) {
  // Remove existing listeners
  group.off("mousedblclick");
  
  // Desktop double-click
  group.on("mousedblclick", (e) => {
    e.e.preventDefault();
    showEditDialog(canvas, group);
  });

  // Mobile double-tap
  setupDoubleTap(canvas, group);
}

function showEditDialog(canvas, group) {
  const newText = prompt("Edit text:", group.originalText);
  if (newText && newText !== group.originalText) {
    // Recreate with new text but same styling
    const options = {
      text: newText,
      curveStyle: group.curveStyle,
      fontSize: group.fontSize,
      fontFamily: group.fontFamily,
      fontWeight: group.fontWeight,
      fontStyle: group.fontStyle,
      underline: group.underline,
      linethrough: group.linethrough,
      color: group.textColor,
      borderColor: group.borderColor,
      borderWidth: group.borderWidth,
      radius: group.radius || 200,
      amplitude: group.amplitude || 60,
      letterSpacing: group.letterSpacing || 0,
      reverse: group.reverse || false,
      curveIntensity: group.curveIntensity || 1,
      removeExisting: true
    };
    
    canvas.remove(group);
    addCurvedText(canvas, options);
  }
}

function setupDoubleTap(canvas, group) {
  const el = canvas.upperCanvasEl;
  let lastTap = 0;

  const handler = (e) => {
    const target = canvas.findTarget(e);
    if (target === group || (group._objects && group._objects.includes(target))) {
      const now = Date.now();
      if (now - lastTap < 400) {
        e.preventDefault();
        showEditDialog(canvas, group);
      }
      lastTap = now;
    }
  };

  el.addEventListener("touchstart", handler);
  
  // Store handler for cleanup
  group.doubleTapHandler = handler;
}

// ==================== UPDATE EXISTING TEXT ====================

// In curvedText.js - FIX the updateCurvedText function
export const updateCurvedText = (canvas, group, newOptions) => {
  if (!group || group.customType !== "curvedText") {
    console.warn('No curved text selected to replace');
    return null;
  }
  
  const options = {
    text: group.originalText,
    curveStyle: group.curveStyle,
    fontSize: group.fontSize,
    fontFamily: group.fontFamily,
    fontWeight: group.fontWeight,
    fontStyle: group.fontStyle,
    underline: group.underline,
    linethrough: group.linethrough,
    color: group.textColor,
    borderColor: group.borderColor,
    borderWidth: group.borderWidth,
    radius: group.radius || 200,
    amplitude: group.amplitude || 60,
    letterSpacing: group.letterSpacing || 0,
    reverse: group.reverse || false,
    curveIntensity: group.curveIntensity || 1,
    ...newOptions
  };
  
  // Store position of the selected group
  const left = group.left;
  const top = group.top;
  
  // Remove ONLY the selected group, not all curved text
  canvas.remove(group);
  
  // Create new text at the SAME position
  const centerX = left || canvas.getWidth() / 2;
  const centerY = top || canvas.getHeight() / 2;
  
  let letters = [];
  
  // Create text based on selected style
  switch (options.curveStyle) {
    case CURVE_STYLES.ARCH:
      letters = createArchText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.color, options.borderColor, options.borderWidth, options.radius, options.letterSpacing, options.reverse);
      break;
    case CURVE_STYLES.CIRCLE:
      letters = createCircleText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.color, options.borderColor, options.borderWidth, options.radius, options.letterSpacing, options.reverse);
      break;
    case CURVE_STYLES.WAVE:
      letters = createWaveText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.color, options.borderColor, options.borderWidth, options.amplitude, options.letterSpacing, options.reverse);
      break;
    case CURVE_STYLES.INVERTED_ARCH:
      letters = createInvertedArchText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.color, options.borderColor, options.borderWidth, options.radius, options.letterSpacing, options.reverse);
      break;
    case CURVE_STYLES.SPIRAL:
      letters = createSpiralText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.color, options.borderColor, options.borderWidth, options.radius, options.curveIntensity, options.letterSpacing, options.reverse);
      break;
    case CURVE_STYLES.RAINBOW:
      letters = createRainbowText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.radius, options.letterSpacing, options.reverse);
      break;
    case CURVE_STYLES.FLAG:
      letters = createFlagText(options.text, centerX, centerY, options.fontSize, options.fontWeight, options.fontFamily, options.fontStyle, options.underline, options.linethrough, options.color, options.borderColor, options.borderWidth, options.amplitude, options.letterSpacing, options.reverse);
      break;
  }

  const newGroup = new Group(letters, {
    originX: "center",
    originY: "center",
    left: centerX,
    top: centerY,
    selectable: true,
    evented: true,
    subTargetCheck: true,
  });
  
  // Copy all styling properties to new group
  newGroup.customType = "curvedText";
  newGroup.curveStyle = options.curveStyle;
  newGroup.originalText = options.text;
  newGroup.fontSize = options.fontSize;
  newGroup.fontFamily = options.fontFamily;
  newGroup.fontWeight = options.fontWeight;
  newGroup.fontStyle = options.fontStyle;
  newGroup.underline = options.underline;
  newGroup.linethrough = options.linethrough;
  newGroup.textColor = options.color;
  newGroup.borderColor = options.borderColor;
  newGroup.borderWidth = options.borderWidth;
  newGroup.radius = options.radius;
  newGroup.amplitude = options.amplitude;
  newGroup.letterSpacing = options.letterSpacing;
  newGroup.reverse = options.reverse;
  newGroup.curveIntensity = options.curveIntensity;

  canvas.add(newGroup);
  canvas.setActiveObject(newGroup);
  canvas.requestRenderAll();

  // Setup interaction handlers
  setupGroupInteractions(canvas, newGroup);
  
  return newGroup;
};

// ==================== EXPORT FONTS FOR UI ====================
export const getAvailableFonts = () => FONTS;

// ==================== FONT LOADING HELPER ====================
export const loadFont = (fontFamily) => {
  // Check if font is already loaded
  if (document.fonts && document.fonts.check(`12px "${fontFamily}"`)) {
    return Promise.resolve();
  }
  
  // Create a font face observer
  return new Promise((resolve) => {
    const text = document.createElement('span');
    text.style.fontFamily = `"${fontFamily}"`;
    text.style.position = 'absolute';
    text.style.left = '-9999px';
    text.innerHTML = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    document.body.appendChild(text);
    
    setTimeout(() => {
      document.body.removeChild(text);
      resolve();
    }, 100);
  });
};