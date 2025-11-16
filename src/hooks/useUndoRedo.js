// hooks/useHistory.js
import { useState, useCallback, useEffect } from "react";

const useHistory = (canvas) => {
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Save current state
  const saveState = useCallback(() => {
    if (!canvas) return;
    const json = canvas.toJSON(["selectable", "evented"]);
    setHistory((prev) => [...prev, json]);
    setRedoStack([]); // clear redo stack on new action
  }, [canvas]);

  // Undo
  const undo = useCallback(() => {
    if (!canvas || history.length <= 1) return;

    const newHistory = [...history];
    const last = newHistory.pop();
    setRedoStack((prev) => [...prev, last]);

    const previous = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    canvas.loadFromJSON(previous).then(() => canvas.requestRenderAll());
  }, [canvas, history]);

  // Redo
  const redo = useCallback(() => {
    if (!canvas || redoStack.length === 0) return;

    const newRedo = [...redoStack];
    const next = newRedo.pop();
    setRedoStack(newRedo);

    setHistory((prev) => [...prev, next]);

    canvas.loadFromJSON(next, () => {
      canvas.renderAll();
    });
  }, [canvas, redoStack]);

  // Save state on canvas changes
  useEffect(() => {
    if (!canvas) return;
    const handleChange = () => saveState();
    canvas.on("object:added", handleChange);
    canvas.on("object:modified", handleChange);
    canvas.on("object:removed", handleChange);

    // Save initial state
    saveState();

    return () => {
      canvas.off("object:added", handleChange);
      canvas.off("object:modified", handleChange);
      canvas.off("object:removed", handleChange);
    };
  }, [canvas, saveState]);

  return {
    undo,
    redo,
    canUndo: history.length > 1,
    canRedo: redoStack.length > 0,
  };
};

export default useHistory;
