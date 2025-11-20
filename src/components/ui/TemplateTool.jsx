import { useState, useEffect, useRef } from "react";
import {
  getTemplatesFromBucket,
  createTemplateThumbnail,
  applyTemplateToCanvas,
} from "../../utils/templateUtils";
import { createNewPage } from "../../utils/pageUtils";

const TemplateTool = ({
  onTemplateSelect,
  canvas,
  setCanvasList,
  setActivePage,
}) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState({});
  const [thumbnailLoading, setThumbnailLoading] = useState({});
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  // Generate thumbnails when templates change
  useEffect(() => {
    if (templates.length > 0) {
      generateThumbnails();
      extractCategories();
    }
  }, [templates]);

  // Filter templates when category changes
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(
        templates.filter((template) => template.category === selectedCategory)
      );
    }
  }, [selectedCategory, templates]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await getTemplatesFromBucket();
      if (result.success) {
        setTemplates(result.templates);
        setFilteredTemplates(result.templates);
      } else {
        console.error("Failed to load templates:", result.error);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractCategories = () => {
    const uniqueCategories = [...new Set(templates.map(t => t.category).filter(Boolean))];
    setCategories(["All", ...uniqueCategories]);
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
          newThumbnails[template.name] = getFallbackThumbnail(template);
        }
      } catch (error) {
        console.error("Error generating thumbnail for:", template.name, error);
        newThumbnails[template.name] = getFallbackThumbnail(template);
      } finally {
        loadingStates[template.name] = false;
      }
    }

    setThumbnails(newThumbnails);
    setThumbnailLoading(loadingStates);
  };

  const handleTemplateClick = async (template) => {
    setSelectedTemplate(template.name);
    
    if (!canvas) {
      console.error("Canvas not available");
      return;
    }

    if (template.jsonData?.pages) {
      const jsonData = template.jsonData?.pages;
      setCanvasList(jsonData);
      createNewPage(canvas, jsonData, setCanvasList, setActivePage);
    } else {
      console.log("Applying template:", {
        name: template.name,
        type: template.type,
        structure: template.jsonData?.pages
          ? "multi-page"
          : template.jsonData?.canvasData
          ? "canvasData"
          : "standard",
      });

      try {
        await applyTemplateToCanvas(canvas, template);
        console.log("Template applied successfully");

        if (onTemplateSelect) {
          onTemplateSelect(template);
        }
      } catch (error) {
        console.error("Error applying template:", error);
        let errorMessage = "Failed to apply template. Please try again.";

        if (error.message.includes("Invalid template structure")) {
          errorMessage =
            "This template has an invalid structure and cannot be loaded.";
        } else if (error.message.includes("loadFromJSON")) {
          errorMessage =
            "Error loading template data. The file may be corrupted.";
        }

        alert(errorMessage);
      }
    }
  };

  const getFallbackThumbnail = (template) => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#f8f9fa"/>
        <rect x="75" y="75" width="150" height="75" fill="#e9ecef" stroke="#6c757d" stroke-width="1"/>
        <text x="150" y="115" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" fill="#6c757d">
          ${template.displayName || template.name}
        </text>
      </svg>
    `)}`;
  };

  const getTemplateThumbnail = (template) => {
    return thumbnails[template.name] || getFallbackThumbnail(template);
  };

  const getBestPreviewImage = (template) => {
    if (template.jsonData?.projectImageUrl) {
      return template.jsonData.projectImageUrl;
    }
    
    if (template.jsonData?.pageImageUrl) {
      return template.jsonData.pageImageUrl;
    }
    
    return getTemplateThumbnail(template);
  };

  const getTemplateDisplayName = (template, index) => {
    return (
      template.displayName ||
      template.name.replace(/\.[^/.]+$/, "") ||
      `Template ${index + 1}`
    );
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold">Templates</h2>
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm text-gray-600 whitespace-nowrap">
              Filter by:
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <strong>Selected:</strong>
              <span className="ml-1">
                {getTemplateDisplayName(
                  templates.find((t) => t.name === selectedTemplate),
                  templates.findIndex((t) => t.name === selectedTemplate)
                )}
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
          maxHeight: "calc(100vh - 200px)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Template Grid - Single column for larger previews */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.name}
              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedTemplate === template.name
                  ? "border-blue-500 shadow-lg bg-blue-50"
                  : "border-gray-200 hover:shadow-md bg-white"
              }`}
              onClick={() => handleTemplateClick(template)}
            >
              {/* Large Preview Image */}
              <div className="aspect-video bg-gray-50 flex items-center justify-center relative">
                {thumbnailLoading[template.name] ? (
                  <div className="text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-sm">Loading preview...</div>
                  </div>
                ) : (
                  <>
                    <img
                      src={getBestPreviewImage(template)}
                      alt={getTemplateDisplayName(template, index)}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = getFallbackThumbnail(template);
                      }}
                    />

                    {/* Selection Indicator */}
                    {selectedTemplate === template.name && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Template Name Only */}
              <div className="p-3 border-t bg-white">
                <h3 className="font-medium text-gray-900 text-center">
                  {getTemplateDisplayName(template, index)}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-lg mb-2">No templates found</div>
            <div className="text-sm">
              {selectedCategory !== "All" 
                ? `No templates in category "${selectedCategory}"`
                : "Upload templates to get started"
              }
            </div>
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

// Helper function to format file size (keeping for potential future use)
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default TemplateTool;