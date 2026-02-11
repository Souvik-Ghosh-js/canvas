// utils/addWordCurve.js
import { Group, Textbox } from "fabric";

const CURVE_STYLES = {
  ARCH: "arch",
  CIRCLE: "circle",
  WAVE: "wave",
  INVERTED_ARCH: "inverted-arch"
};

// Add these to your utils/addWordCurve.js

export const createSpiralText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, radius = 150, intensity = 1, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const totalAngle = Math.PI * 4; // Two full rotations
  const step = totalAngle / (str.length - 1 || 1);
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const angle = i * step;
    const spiralRadius = radius + (i * intensity * 10);
    const x = centerX + spiralRadius * Math.cos(angle);
    const y = centerY + spiralRadius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI + 90;

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
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
    const color = rainbowColors[i % rainbowColors.length];

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, '#000000', 0, letterSpacing));
  });
  return letters;
};

export const createFlagText = (str, centerX, centerY, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, amplitude = 50, letterSpacing = 0, reverse = false) => {
  const letters = [];
  const totalWidth = fontSize * 0.8 * str.length;
  const startX = centerX - totalWidth / 2 + fontSize / 2;
  
  let textArray = reverse ? str.split('').reverse() : str.split('');

  textArray.forEach((ch, i) => {
    const x = startX + i * fontSize * 0.8;
    const y = centerY + amplitude * Math.sin(i * Math.PI / 2);
    const slope = amplitude * (Math.PI / 2) * Math.cos(i * Math.PI / 2);
    const textAngle = Math.atan(slope / (fontSize * 0.8)) * 180 / Math.PI;

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight, fontFamily, fontStyle, underline, linethrough, color, borderColor, borderWidth, letterSpacing));
  });
  return letters;
};
export const addWordCurve = (canvas, str = "Fabric.js Curved Text", options = {}) => {
  str = prompt("Enter your text", str || "Fabric.js Curved Text");
  if (!str) return;

  // Show curve style options
  const curveStyle = showCurveOptions();
  if (!curveStyle) return;

  const centerX = canvas.getWidth() / 2;
  const centerY = canvas.getHeight() / 2;

  // Remove old curved text if it exists
  const existingGroup = canvas
    .getObjects()
    .find((o) => o.customType === "curvedText");
  if (existingGroup) canvas.remove(existingGroup);

  let letters = [];
  const fontSize = 40;
  const fontWeight = 700;

  switch (curveStyle) {
    case CURVE_STYLES.ARCH:
      letters = createArchText(str, centerX, centerY, fontSize, fontWeight);
      break;
    case CURVE_STYLES.CIRCLE:
      letters = createCircleText(str, centerX, centerY, fontSize, fontWeight);
      break;
    case CURVE_STYLES.WAVE:
      letters = createWaveText(str, centerX, centerY, fontSize, fontWeight);
      break;
    case CURVE_STYLES.INVERTED_ARCH:
      letters = createInvertedArchText(str, centerX, centerY, fontSize, fontWeight);
      break;
  }

  const group = new Group(letters, {
    originX: "center",
    originY: "center",
    left: centerX,
    top: centerY,
    selectable: true,
    evented: true,
    subTargetCheck: true, // Important for detecting clicks on letters
  });
  
  group.customType = "curvedText";
  group.curveStyle = curveStyle;
  group.originalText = str;

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();

  // Setup interaction handlers
  setupInteractions(canvas, group, str);
};

// --- Curve Creation Functions ---

function createArchText(str, centerX, centerY, fontSize, fontWeight) {
  const letters = [];
  const radius = 200;
  const arcLength = Math.PI; // 180 degrees
  const startAngle = -Math.PI / 2 - arcLength / 2;
  const step = arcLength / (str.length - 1 || 1);

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    // Perpendicular angle for text orientation
    const textAngle = (angle * 180) / Math.PI + 90;

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight));
  }
  return letters;
}

function createCircleText(str, centerX, centerY, fontSize, fontWeight) {
  const letters = [];
  const radius = 180;
  const startAngle = 0;
  const step = (Math.PI * 2) / str.length;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    // Text faces outward from center
    const textAngle = (angle * 180) / Math.PI + 90;

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight));
  }
  return letters;
}

function createWaveText(str, centerX, centerY, fontSize, fontWeight) {
  const letters = [];
  const amplitude = 60;
  const period = 2 * Math.PI / (str.length - 1 || 1) * 4;
  const totalWidth = fontSize * 0.8 * str.length;
  const startX = centerX - totalWidth / 2 + fontSize / 2;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const x = startX + i * fontSize * 0.8;
    const y = centerY + amplitude * Math.sin(i * period);
    // Slight rotation based on wave slope
    const slope = amplitude * period * Math.cos(i * period);
    const textAngle = Math.atan(slope / (fontSize * 0.8)) * 180 / Math.PI;

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight));
  }
  return letters;
}

function createInvertedArchText(str, centerX, centerY, fontSize, fontWeight) {
  const letters = [];
  const radius = 200;
  const arcLength = Math.PI; // 180 degrees
  const startAngle = Math.PI / 2 - arcLength / 2; // Start from bottom
  const step = arcLength / (str.length - 1 || 1);

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const angle = startAngle + i * step;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const textAngle = (angle * 180) / Math.PI - 90; // Different orientation

    letters.push(createLetter(ch, x, y, textAngle, fontSize, fontWeight));
  }
  return letters;
}

// Helper to create individual letters with consistent styling
function createLetter(char, x, y, angle, fontSize, fontWeight) {
  return new Textbox(char, {
    left: x,
    top: y,
    originX: "center",
    originY: "center",
    angle: angle,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontFamily: "Arial",
    fill: "#333",
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

// --- UI Helpers ---

function showCurveOptions() {
  const options = [
    "🏛️ Arch (Semi-circle)",
    "⭕ Circle (Full circle)",
    "🌊 Wave (Sine wave)",
    "⬇️ Inverted Arch (Upside down)"
  ];
  
  const choice = prompt(
    "Choose curve style:\n1. " + options[0] + 
    "\n2. " + options[1] + 
    "\n3. " + options[2] + 
    "\n4. " + options[3],
    "1"
  );

  switch (choice?.trim()) {
    case "1": return CURVE_STYLES.ARCH;
    case "2": return CURVE_STYLES.CIRCLE;
    case "3": return CURVE_STYLES.WAVE;
    case "4": return CURVE_STYLES.INVERTED_ARCH;
    default: return null;
  }
}

// --- Interaction Handlers ---

function handleEdit(canvas, group, oldText) {
  const newText = prompt("Edit your text:", oldText);
  if (newText && newText !== oldText) {
    const curveStyle = group.curveStyle || CURVE_STYLES.ARCH;
    canvas.remove(group);
    addWordCurve(canvas, newText, { curveStyle });
  }
}

function setupInteractions(canvas, group, oldText) {
  // Desktop double-click
  group.on("mousedblclick", (e) => {
    e.e.preventDefault();
    handleEdit(canvas, group, oldText);
  });

  // Mobile double-tap
  setupDoubleTap(canvas, group, oldText);
}

function setupDoubleTap(canvas, group, oldText) {
  const el = canvas.upperCanvasEl;
  let lastTap = 0;
  let touchTimeout;

  const doubleTapHandler = (e) => {
    const target = canvas.findTarget(e);
    
    // Check if target is the group or any letter in the group
    const isGroupTarget = target === group || 
      (group._objects && group._objects.includes(target));

    if (isGroupTarget) {
      const now = Date.now();
      if (now - lastTap < 400) {
        e.preventDefault();
        if (touchTimeout) clearTimeout(touchTimeout);
        handleEdit(canvas, group, oldText);
      }
      lastTap = now;
    }
  };

  el.addEventListener("touchstart", doubleTapHandler);
  
  // Store the handler for cleanup (optional)
  group.doubleTapHandler = doubleTapHandler;
}

// Add a function to adjust curve parameters
export const adjustCurve = (canvas, group, property, value) => {
  if (!group || group.customType !== "curvedText") return;
  
  const oldText = group.originalText;
  const curveStyle = group.curveStyle;
  
  // Recreate with adjusted parameters
  canvas.remove(group);
  addWordCurve(canvas, oldText, { 
    curveStyle,
    ...property && { [property]: value }
  });
};