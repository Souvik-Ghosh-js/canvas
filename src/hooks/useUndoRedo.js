// hooks/useHistory.js
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_HISTORY = 50;

const useHistory = (canvas) => {
  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const isRestoring = useRef(false);
  const debounceTimer = useRef(null);

  const [, forceUpdate] = useState(0); // for UI re-render only

  const updateUI = () => forceUpdate((n) => n + 1);

  // ✅ SAFE SAVE STATE
  const saveState = useCallback(() => {
    if (!canvas || isRestoring.current) return;

    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const json = canvas.toJSON(["selectable", "evented"]);
      const last = historyRef.current.at(-1);

      if (JSON.stringify(last) === JSON.stringify(json)) return;

      historyRef.current.push(json);

      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      }

      redoRef.current = []; // clear redo on new change
      updateUI();
    }, 150);
  }, [canvas]);

  const undo = useCallback(() => {
    if (!canvas || historyRef.current.length <= 1) return;

    isRestoring.current = true;

    const current = historyRef.current.pop();
    redoRef.current.push(current);

    const previous = historyRef.current.at(-1);

    canvas.loadFromJSON(previous, () => {
      canvas.getObjects().forEach((obj) => {
        obj.set({
          selectable: true,
          evented: true,
          visible: true,
        });
      });

      canvas.discardActiveObject();
      canvas.calcOffset(); // ✅ FIX HITBOX
      canvas.requestRenderAll(); // ✅ FORCE REFRESH
      isRestoring.current = false;
      updateUI();
    });
  }, [canvas]);

  const redo = useCallback(() => {
    if (!canvas || redoRef.current.length === 0) return;

    isRestoring.current = true;

    const next = redoRef.current.pop();
    historyRef.current.push(next);

    canvas.loadFromJSON(next, () => {
      canvas.getObjects().forEach((obj) => {
        obj.set({
          selectable: true,
          evented: true,
          visible: true,
        });
      });

      canvas.discardActiveObject();
      canvas.calcOffset(); // ✅ FIX HITBOX
      canvas.requestRenderAll(); // ✅ FORCE REFRESH
      isRestoring.current = false;
      updateUI();
    });
  }, [canvas]);

  // ✅ FABRIC EVENT BINDING
  useEffect(() => {
    if (!canvas) return;

    const handler = () => saveState();

    canvas.on("object:added", handler);
    canvas.on("object:modified", handler);
    canvas.on("object:removed", handler);

    // ✅ Save first empty state ONLY ONCE
    if (historyRef.current.length === 0) {
      const initial = canvas.toJSON(["selectable", "evented"]);
      historyRef.current.push(initial);
    }

    return () => {
      canvas.off("object:added", handler);
      canvas.off("object:modified", handler);
      canvas.off("object:removed", handler);
    };
  }, [canvas, saveState]);
  // ✅ KEYBOARD SHORTCUTS: CTRL + Z / CTRL + Y
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo → Ctrl + Z
      if (e.ctrlKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }

      // Redo → Ctrl + Y
      if (e.ctrlKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }

      // ✅ Optional: Ctrl + Shift + Z for Redo (Design software style)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo: historyRef.current.length > 1,
    canRedo: redoRef.current.length > 0,
    history: historyRef.current,
    redoStack: redoRef.current,
  };
};

export default useHistory;
