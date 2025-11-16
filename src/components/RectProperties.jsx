import Inputs from "./ui/Inputs";

export default function RectProperties({
  width,
  height,
  color,
  opacity,
  stroke,
  strokeColor,
  onWidthChange,
  onHeightChange,
  onColorChange,
  onStrokeChange,
  onStrokeColorChange,
  onOpacityChange,
}) {
  return (
    <section className="flex justify-between px-2 flex-wrap gap-3">
      <Inputs icon="W" value={width} onChange={onWidthChange} type="number" />
      <Inputs icon="H" value={height} onChange={onHeightChange} type="number" />
      <Inputs
        icon="O"
        value={opacity * 100}
        onChange={onOpacityChange}
        type="number"
      />
      <Inputs icon="Fill" value={color} onChange={onColorChange} type="color" />
      <Inputs icon="S" value={stroke} onChange={onStrokeChange} type="number" />
      <Inputs
        icon="Fill"
        value={strokeColor}
        onChange={onStrokeColorChange}
        type="color"
      />
    </section>
  );
}
