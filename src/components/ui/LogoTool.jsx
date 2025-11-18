import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/config"; // Adjust the import path

function LogoTool({ addBackground }) {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogosFromSupabase();
  }, []);

  const fetchLogosFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .storage
        .from('logo') // Your bucket name
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw error;
      }

      // Get public URLs for each logo
      const logosWithUrls = data.map(file => {
        const { data: urlData } = supabase
          .storage
          .from('logo')
          .getPublicUrl(file.name);

        return {
          url: urlData.publicUrl,
          name: file.name
        };
      });

      setLogos(logosWithUrls);
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Loading logos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <p>Error loading logos: {error}</p>
        <button 
          onClick={fetchLogosFromSupabase}
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
        <h1 className="font-semibold mb-2">School Logo</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="flex flex-wrap justify-between gap-2 mt-5 px-4 h-80 overflow-scroll overflow-x-hidden">
        {logos.length > 0 ? (
          logos.map((logo, index) => (
            <img
              key={index}
              src={logo.url}
              alt={`Logo ${index + 1}`}
              className="h-20 w-20 object-contain cursor-pointer bg-gray-100 rounded p-1"
              onClick={() => {
                addBackground(logo.url);
              }}
            />
          ))
        ) : (
          <div className="w-full text-center py-8">
            <p>No logos found</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default LogoTool;