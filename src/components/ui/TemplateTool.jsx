import { useState, useEffect, useRef } from "react";
import { getTemplatesFromBucket, createTemplateThumbnail, applyTemplateToCanvas } from "../../utils/templateUtils";

const TemplateTool = ({ onTemplateSelect, canvas }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState({});
  const [thumbnailLoading, setThumbnailLoading] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Generate thumbnails when templates change
  useEffect(() => {
    if (templates.length > 0) {
      generateThumbnails();
    }
  }, [templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await getTemplatesFromBucket();
      if (result.success) {
        setTemplates(result.templates);
      } else {
        console.error("Failed to load templates:", result.error);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = async () => {
    const newThumbnails = {};
    const loadingStates = {};
    
    for (const template of templates) {
      loadingStates[template.name] = true;
      try {
        const thumbnail = await createTemplateThumbnail(template);
        if (thumbnail) {
          newThumbnails[template.name] = thumbnail;
        } else {
          // Use fallback for failed thumbnails
          newThumbnails[template.name] = getFallbackThumbnail(template);
        }
      } catch (error) {
        console.error('Error generating thumbnail for:', template.name, error);
        newThumbnails[template.name] = getFallbackThumbnail(template);
      } finally {
        loadingStates[template.name] = false;
      }
    }
    
    setThumbnails(newThumbnails);
    setThumbnailLoading(loadingStates);
  };

const handleTemplateClick = async (template) => {
  if (!canvas) {
    console.error('Canvas not available');
    return;
  }

  console.log('Applying template:', {
    name: template.name,
    type: template.type,
    structure: template.jsonData?.pages ? 'multi-page' : 
               template.jsonData?.canvasData ? 'canvasData' : 
               'standard'
  });

  try {
    // Apply template to canvas
    await applyTemplateToCanvas(canvas, template);
    
    console.log('Template applied successfully');
    
    // Notify parent component
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  } catch (error) {
    console.error('Error applying template:', error);
    
    // More detailed error message
    let errorMessage = 'Failed to apply template. Please try again.';
    
    if (error.message.includes('Invalid template structure')) {
      errorMessage = 'This template has an invalid structure and cannot be loaded.';
    } else if (error.message.includes('loadFromJSON')) {
      errorMessage = 'Error loading template data. The file may be corrupted.';
    }
    
    alert(errorMessage);
  }
};


  const getFallbackThumbnail = (template) => {
    if (template.type === 'application/json') {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" fill="#f8f9fa"/>
          <rect x="50" y="50" width="100" height="50" fill="#e9ecef" stroke="#6c757d" stroke-width="1"/>
          <text x="100" y="75" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#6c757d">JSON Template</text>
          <text x="100" y="95" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#6c757d">${template.displayName || template.name}</text>
        </svg>
      `)}`;
    } else {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" fill="#f8f9fa"/>
          <rect x="60" y="50" width="80" height="60" fill="#e9ecef" stroke="#6c757d" stroke-width="1"/>
          <circle cx="100" y="40" r="15" fill="#6c757d"/>
          <text x="100" y="95" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="12" fill="#6c757d">Image Template</text>
        </svg>
      `)}`;
    }
  };

  const getTemplateThumbnail = (template) => {
    // Return generated thumbnail or fallback
    return thumbnails[template.name] || getFallbackThumbnail(template);
  };

  const getTemplateDisplayName = (template, index) => {
    return template.displayName || template.name.replace(/\.[^/.]+$/, "") || `Template ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Loading templates...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Templates</h2>
        
        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <strong>Selected:</strong> 
              <span className="ml-1">
                {getTemplateDisplayName(templates.find(t => t.name === selectedTemplate), templates.findIndex(t => t.name === selectedTemplate))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Template Container */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
        }}
      >
        {/* Template Grid with Vertical Scrolling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((template, index) => (
            <div
              key={template.name}
              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === template.name 
                  ? 'border-blue-500 shadow-lg bg-blue-50' 
                  : 'border-gray-200 hover:shadow-md bg-white'
              }`}
              onClick={() => handleTemplateClick(template)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-50 flex items-center justify-center relative">
                {thumbnailLoading[template.name] ? (
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-xs">Loading...</div>
                  </div>
                ) : (
                  <>
                    <img
                      src={getTemplateThumbnail(template)}
                      alt={getTemplateDisplayName(template, index)}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // If image fails to load, use fallback
                        e.target.src = getFallbackThumbnail(template);
                      }}
                    />
                    
                    {/* Template Type Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        template.type === 'application/json' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {template.type === 'application/json' ? 'JSON' : 'IMG'}
                      </span>
                    </div>

                    {/* Selection Indicator */}
                    {selectedTemplate === template.name && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Template Info */}
              <div className="p-3 border-t">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-sm text-gray-900 truncate flex-1">
                    {getTemplateDisplayName(template, index)}
                  </h3>
                </div>
                
                {template.category && template.category !== 'Other' && (
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-2">
                    {template.category}
                  </span>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {template.type === 'application/json' ? 'JSON Template' : 'Image Template'}
                  </span>
                  <span>
                    {formatFileSize(template.size)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {templates.length === 0 && (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-lg mb-2">No templates available</div>
            <div className="text-sm">Upload templates to get started</div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="p-4 border-t">
        <button
          onClick={loadTemplates}
          className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          Refresh Templates
        </button>
      </div>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default TemplateTool;