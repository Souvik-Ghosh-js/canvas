import React, { useEffect, useState } from "react";
import { getSchoolImages } from "../../utils/schoolutils"; // Adjust path as needed

function SchoolNameTool({ addSchoolName }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchoolImages();
  }, []);

  const loadSchoolImages = async () => {
    try {
      const result = await getSchoolImages();
      if (result.success) {
        setSchools(result.data);
      } else {
        console.error('Failed to load school images:', result.error);
      }
    } catch (error) {
      console.error('Error loading school images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to extract school name from filename (optional)
  const getSchoolNameFromFileName = (fileName) => {
    // Remove file extension and replace underscores/dashes with spaces
    return fileName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[_-]/g, " ") // Replace underscores and dashes with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading school images...</div>
      </div>
    );
  }

  return (
    <div>
      <section>
        <h1 className="font-semibold mb-2">School Logos</h1>
        <hr className="border-gray-300" />
      </section>
      <section className="h-[250px] overflow-y-auto mt-2">
        {schools.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No school images found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-2">
            {schools.map((school, index) => (
              <div
                key={index}
                className="cursor-pointer group hover:bg-gray-50 rounded-lg p-2 transition-all duration-200"
                onClick={() => addSchoolName(getSchoolNameFromFileName(school.name))}
              >
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={school.url}
                    alt={getSchoolNameFromFileName(school.name)}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMTBWMTIwSDE0MFYxMDBIMjBWNjBIODBaIiBmaWxsPSIjOTlBQUFEIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <p className="text-xs text-center mt-2 font-medium text-gray-700 truncate">
                  {getSchoolNameFromFileName(school.name)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default SchoolNameTool;