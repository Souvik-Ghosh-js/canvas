import React from "react";
import Inputs from "./ui/Inputs";

function CanvasProperties({ height, width, color, onColorChange }) {
  return (
    <section className="flex justify-between px-2 flex-wrap gap-3">
      <Inputs type={"number"} icon={"H"} value={height} onChange={() => {}} />
      <Inputs type={"number"} icon={"W"} value={width} onChange={() => {}} />
      <Inputs type="color" icon={"B"} value={color} onChange={onColorChange} />
    </section>
  );
}

export default CanvasProperties;
