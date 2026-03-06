import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/config"; // Adjust the import path

function BGTool({ addBackground }) {
  const [bgs, setBgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opacity, setOpacity] = useState(100); // Default opacity 100%
  const [selectedBg, setSelectedBg] = useState(null);

  useEffect(() => {
    fetchBackgroundsFromSupabase();
  }, []);

  const fetchBackgroundsFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .storage
        .from('background') // Your bucket name
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw error;
      }

      // Get public URLs for each background
      const backgroundsWithUrls = data.map(file => {
        const { data: urlData } = supabase
          .storage
          .from('background')
          .getPublicUrl(file.name);

        return {
          url: urlData.publicUrl,
          name: file.name
        };
      });

      setBgs(backgroundsWithUrls);
    } catch (err) {
      console.error('Error fetching backgrounds:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundClick = (bg) => {
    setSelectedBg(bg);
    // Pass both URL and opacity to parent
    addBackground(bg.url, opacity / 100);
  };

  const handleOpacityChange = (e) => {
    const newOpacity = parseInt(e.target.value);
    setOpacity(newOpacity);
    
    // If a background is selected, update its opacity in real-time
    if (selectedBg) {
      addBackground(selectedBg.url, newOpacity / 100);
    }
  };

  const handleResetOpacity = () => {
    setOpacity(100);
    if (selectedBg) {
      addBackground(selectedBg.url, 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Loading backgrounds...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <p>Error loading backgrounds: {error}</p>
        <button 
          onClick={fetchBackgroundsFromSupabase}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <section>
        <h1 className="font-semibold mb-2">Backgrounds</h1>
        <hr className="border-gray-300" />
      </section>
      
      {/* Opacity Control Section */}
      <section className="mt-4 px-4 py-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="opacity-slider" className="text-sm font-medium text-gray-700">
            Background Opacity: {opacity}%
          </label>
          <button
            onClick={handleResetOpacity}
            className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            title="Reset to 100%"
          >
            Reset
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            id="opacity-slider"
            min="0"
            max="100"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-sm font-mono min-w-[45px] text-right">
            {opacity}%
          </span>
        </div>
        {selectedBg && (
          <p className="text-xs text-gray-500 mt-2">
            Adjusting opacity for: {selectedBg.name}
          </p>
        )}
      </section>

      {/* Backgrounds Grid Section */}
      <section className="flex flex-wrap justify-between gap-2 mt-4 px-4 h-80 overflow-scroll overflow-x-hidden">
        {bgs.length > 0 ? (
          bgs.map((bg, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer transition-all ${
                selectedBg?.name === bg.name ? 'ring-2 ring-blue-500 rounded' : ''
              }`}
              onClick={() => handleBackgroundClick(bg)}
            >
              <img
                src={bg.url}
                alt={`Background ${index + 1}`}
                className="h-30 object-cover rounded"
                style={{ opacity: selectedBg?.name === bg.name ? opacity / 100 : 1 }}
              />
              {selectedBg?.name === bg.name && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
                  <span className="text-white text-xs font-semibold bg-blue-500 px-2 py-1 rounded">
                    Selected
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="w-full text-center py-8">
            <p>No backgrounds found</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default BGTool;