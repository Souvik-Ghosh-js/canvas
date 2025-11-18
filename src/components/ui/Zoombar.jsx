export default function ZoomBar({ zoom, setZoom }) {
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;
  const STEP = 0.1;

  const updateZoom = (newZoom) => {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    setZoom(parseFloat(z.toFixed(2)));
  };

  return (
    <div className="flex items-center gap-4 w-full max-w-[420px] my-4 p-3 bg-gray-100 rounded-xl shadow-sm">

      {/* Zoom Out */}
      <button
        onClick={() => updateZoom(zoom - STEP)}
        className="px-3 py-1 bg-white border rounded-lg shadow-sm hover:bg-gray-200"
      >
        -
      </button>

      {/* Slider */}
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={STEP}
        value={zoom}
        onChange={(e) => updateZoom(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
      />

      {/* Zoom In */}
      <button
        onClick={() => updateZoom(zoom + STEP)}
        className="px-3 py-1 bg-white border rounded-lg shadow-sm hover:bg-gray-200"
      >
        +
      </button>

      {/* Reset */}
      <button
        onClick={() => updateZoom(1)}
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
      >
        Reset
      </button>

      {/* Percentage */}
      <span className="text-sm font-semibold w-12 text-right">{Math.round(zoom * 100)}%</span>
    </div>
  );
}
