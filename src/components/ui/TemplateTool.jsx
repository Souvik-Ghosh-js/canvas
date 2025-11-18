import { useState, useEffect } from "react";
import { getTemplatesFromBucket } from "../../utils/templateUtils";

const TemplateTool = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
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

  const handleTemplateClick = (templateUrl) => {
    onTemplateSelect(templateUrl);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Templates</h2>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTemplateClick(template.url)}
          >
            <img
              src={template.url}
              alt={`Template ${index + 1}`}
              className="w-full h-32 object-cover"
            />
            <div className="p-2 text-center text-sm bg-gray-50">
              Template {index + 1}
            </div>
          </div>
        ))}
      </div>
      {templates.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No templates available
        </div>
      )}
    </div>
  );
};

export default TemplateTool;