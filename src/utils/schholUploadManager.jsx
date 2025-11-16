import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/config";
import { Trash2, Download } from "lucide-react";

const SchoolImageManager = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchoolImages();
  }, []);

  const loadSchoolImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('schools')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      const schoolsWithUrls = data.map(file => ({
        name: file.name,
        url: supabase.storage.from('schools').getPublicUrl(file.name).data.publicUrl,
        createdAt: file.created_at
      }));

      setSchools(schoolsWithUrls);
    } catch (error) {
      console.error('Error loading school images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSchoolImage = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this school image?')) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('schools')
        .remove([fileName]);

      if (error) throw error;

      setSchools(prev => prev.filter(school => school.name !== fileName));
      alert('School image deleted successfully!');
    } catch (error) {
      console.error('Error deleting school image:', error);
      alert('Failed to delete school image');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Manage School Images</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">Loading school images...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Manage School Images</h3>
      
      {schools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No school images found. Upload some images to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={school.url}
                  alt={school.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {school.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(school.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-2 ml-2">
                  <a
                    href={school.url}
                    download={school.name}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Download"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => deleteSchoolImage(school.name)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolImageManager;