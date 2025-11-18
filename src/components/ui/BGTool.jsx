import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/config"; // Adjust the import path

function BGTool({ addBackground }) {
  const [bgs, setBgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <section className="flex flex-wrap justify-between gap-2 mt-5 px-4 h-80 overflow-scroll overflow-x-hidden">
        {bgs.length > 0 ? (
          bgs.map((bg, index) => (
            <img
              key={index}
              src={bg.url}
              alt={`Background ${index + 1}`}
              className="h-30 cursor-pointer object-cover rounded"
              onClick={() => {
                addBackground(bg.url);
              }}
            />
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