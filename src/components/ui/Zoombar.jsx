export default function ZoomBar({ zoom, setZoom }) {
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;
  const STEP = 0.1;

  const updateZoom = (newZoom) => {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    setZoom(parseFloat(z.toFixed(2)));
  };

  return (
    <div className="flex items-center gap-1.5 w-full max-w-[500px] p-1.5 bg-white border border-gray-300 rounded-md">

      {/* Zoom Out */}
      <button
        onClick={() => updateZoom(zoom - STEP)}
        className="w-6 h-6 flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 transition-colors"
        title="Zoom Out"
      >
        −
      </button>

      {/* Slider */}
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={STEP}
        value={zoom}
        onChange={(e) => updateZoom(parseFloat(e.target.value))}
        className="flex-1 accent-blue-500 h-1"
      />

      {/* Percentage */}
      <span className="text-xs font-medium w-8 text-center">{Math.round(zoom * 100)}%</span>

      {/* Zoom In */}
      <button
        onClick={() => updateZoom(zoom + STEP)}
        className="w-6 h-6 flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200 transition-colors"
        title="Zoom In"
      >
        +
      </button>

      {/* Reset */}
      <button
        onClick={() => updateZoom(1)}
        className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        title="Reset Zoom"
      >
        1:1
      </button>
    </div>
  );
}