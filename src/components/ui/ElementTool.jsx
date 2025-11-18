import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase/config";
import { Search, Image, Download } from "lucide-react";

const ElementTool = ({ action }) => {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadElements();
  }, []);

  const loadElements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('element')
        .list('', {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      const elementsWithUrls = await Promise.all(
        data.map(async (file) => {
          const url = supabase.storage.from('element').getPublicUrl(file.name).data.publicUrl;
          
          // Extract display name from filename
          const displayName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase());

          return {
            name: file.name,
            url: url,
            displayName: displayName,
            createdAt: file.created_at,
          };
        })
      );

      setElements(elementsWithUrls);
    } catch (error) {
      console.error('Error loading elements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredElements = elements.filter(element =>
    element.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleElementClick = (element) => {
    action(element.url);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center text-gray-500 mt-2">Loading elements...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Design Elements</h2>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search elements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Elements Grid */}
      {filteredElements.length === 0 ? (
        <div className="text-center py-8">
          <Image className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-500">No elements found</p>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredElements.map((element, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => handleElementClick(element)}
            >
              <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center mb-2">
                <img
                  src={element.url}
                  alt={element.displayName}
                  className="max-w-full max-h-full object-contain p-2"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyNEgzNlYzNkgyNFYyNFoiIGZpbGw9IiM5OUFBQUQiLz4KPC9zdmc+Cg==';
                  }}
                />
              </div>
              <p className="text-xs font-medium text-gray-700 text-center truncate" title={element.displayName}>
                {element.displayName}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Click on any element to add it to your design. 
          Elements will be placed in the center of your canvas.
        </p>
      </div>
    </div>
  );
};

export default ElementTool;