// utils/addWordCurve.js
import { Group, Textbox } from "fabric";

export const addWordCurve = (canvas, str = "Fabric.js Curved Text") => {
  str = prompt("Enter your text", str || "Fabric.js Curved Text");
  const radius = 150;
  const centerX = canvas.getWidth() / 2;
  const centerY = canvas.getHeight() / 2 + 80;

  // Remove old curved text if it exists
  const existingGroup = canvas
    .getObjects()
    .find((o) => o.customType === "curvedText");
  if (existingGroup) canvas.remove(existingGroup);

  const baseAngle = Math.PI * 1.5;
  const arc = Math.PI / 1.25;
  const start = baseAngle - arc / 2;
  const step = arc / (str.length - 1);

  const letters = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const theta = start + i * step;
    const x = centerX + radius * Math.cos(theta);
    const y = centerY + radius * Math.sin(theta);
    const angleDeg = (theta * 180) / Math.PI + 90;

    letters.push(
      new Textbox(ch, {
        left: x,
        top: y,
        originX: "center",
        originY: "center",
        angle: angleDeg,
        fontSize: 40,
        fontWeight: 700,
        fill: "#333",
        selectable: true,
        evented: true,
      })
    );
  }

  const group = new Group(letters, {
    originX: "center",
    originY: "center",
    left: centerX,
    top: centerY,
    selectable: true,
    evented: true,
  });
  group.customType = "curvedText";

  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();

  // 🖱️ Desktop double-click
  group.on("mousedblclick", () => handleEdit(canvas, group, str));

  // 📱 Mobile double-tap
  setupDoubleTap(canvas, group, str);
};

// --- Editing Helper ---
function handleEdit(canvas, group, oldText) {
  const newText = prompt("Edit your text:", oldText);
  if (newText && newText !== oldText) {
    canvas.remove(group);
    addWordCurve(canvas, newText);
  }
}

// --- Mobile double-tap handler ---
function setupDoubleTap(canvas, group, oldText) {
  const el = canvas.upperCanvasEl;
  let lastTap = 0;

  el.addEventListener("touchstart", (e) => {
    const target = canvas.findTarget(e);
    if (!target) return;
    // Check if target is the group or a letter inside the group
    if (
      target === group ||
      (group._objects && group._objects.includes(target))
    ) {
      const now = Date.now();
      if (now - lastTap < 400) {
        // Double-tap detected 🎯
        e.preventDefault();
        handleEdit(canvas, group, oldText);
      }
      lastTap = now;
    }
  });
}
