import React from "react";
import Inputs from "./ui/Inputs";
import {
  Circle,
  Square,
  Heart,
  Star,
  Hexagon,
  FlipHorizontal2,
  FlipVertical2,
} from "lucide-react";

const shapes = [
  { id: "circle", name: "Circle", icon: Circle },
  { id: "square", name: "Square", icon: Square },
  { id: "heart", name: "Heart", icon: Heart },
  { id: "star", name: "Star", icon: Star },
  { id: "hexagon", name: "Hexagon", icon: Hexagon },
];
function ImageProperties({
  height,
  width,
  onHeightChange,
  onWidthChange,
  onApplyMask,
  onHFlip,
  onVFlip,
}) {
  return (
    <div className="flex justify-between px-2 flex-wrap gap-3">
      <Inputs
        type={"number"}
        icon={"H"}
        value={height}
        onChange={onHeightChange}
      />
      <Inputs
        type={"number"}
        icon={"W"}
        value={width}
        onChange={onWidthChange}
      />
      <section className="w-full">
        <h1>Image Flip</h1>
        <section className="flex gap-3 my-2">
          <FlipHorizontal2
            className="bg-gray-300 p-1 cursor-pointer"
            onClick={onHFlip}
          />
          <FlipVertical2
            className="bg-gray-300 p-1 cursor-pointer"
            onClick={onVFlip}
          />
        </section>
      </section>
      <section className="w-full">
        <h1>Image Mask</h1>
        <section className="flex gap-2 my-2">
          {shapes.map((shape) => (
            <shape.icon
              key={shape.id}
              className="cursor-pointer"
              onClick={() => onApplyMask(shape.id)}
            />
          ))}
        </section>
      </section>
    </div>
  );
}

export default ImageProperties;
