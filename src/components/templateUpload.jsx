import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/config"; // Adjust path as needed
import { Trash2, Download, Upload, Eye, FileText, Image } from "lucide-react";

const TemplateUpload = () => {
  const [activeSection, setActiveSection] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Sample categories - you can make this dynamic
  const defaultCategories = [
    "Certificate",
    "Diploma", 
    "Award",
    "Invitation",
    "Brochure",
    "Flyer",
    "Poster",
    "Business Card",
    "Letterhead",
    "Other"
  ];

  // Load templates when component mounts or when activeSection changes to manage
  useEffect(() => {
    if (activeSection === "manage") {
      loadTemplates();
      loadCategories();
    }
  }, [activeSection]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('templates')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      const templatesWithUrls = await Promise.all(
        data.map(async (file) => {
          const url = supabase.storage.from('templates').getPublicUrl(file.name).data.publicUrl;
          
          // Try to get metadata from a separate table if you have one
          // For now, we'll extract from filename
          const metadata = extractMetadataFromFileName(file.name);
          
          return {
            name: file.name,
            url: url,
            displayName: metadata.name,
            category: metadata.category,
            description: metadata.description,
            createdAt: file.created_at,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'image/jpeg'
          };
        })
      );

      setTemplates(templatesWithUrls);
    } catch (error) {
      console.error('Error loading templates:', error);
      setMessage({ type: "error", text: "Failed to load templates" });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    // If you have categories in a database table, load them here
    // For now, using default categories
    setCategories(defaultCategories);
  };

  const extractMetadataFromFileName = (fileName) => {
    // Extract metadata from filename pattern: category_name_description.extension
    const withoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const parts = withoutExtension.split('_');
    
    return {
      category: parts[0] || 'Other',
      name: parts[1] ? parts[1].replace(/-/g, ' ') : 'Unnamed Template',
      description: parts[2] ? parts[2].replace(/-/g, ' ') : 'No description'
    };
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg", 
        "image/png", 
        "image/webp", 
        "image/svg+xml",
        "application/json",
        "application/pdf"
      ];
      
      if (!validTypes.includes(file.type)) {
        setMessage({ 
          type: "error", 
          text: "Please select a valid file (JPEG, PNG, WebP, SVG, JSON, PDF)" 
        });
        setSelectedFile(null);
        setPreviewImage(null);
        return;
      }

      // Validate file size (max 10MB for templates)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 10MB" });
        setSelectedFile(null);
        setPreviewImage(null);
        return;
      }

      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        setPreviewImage(URL.createObjectURL(file));
      } else {
        setPreviewImage(null);
      }
      
      setMessage({ type: "", text: "" });
    }
  };

  const uploadTemplate = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select a file to upload" });
      return;
    }

    if (!templateName.trim()) {
      setMessage({ type: "error", text: "Please enter a template name" });
      return;
    }

    if (!templateCategory) {
      setMessage({ type: "error", text: "Please select a category" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      // Create a sanitized filename with metadata
      const fileExtension = selectedFile.name.split('.').pop();
      const sanitizedName = templateName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      
      const sanitizedCategory = templateCategory
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      
      const sanitizedDescription = templateDescription
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 50); // Limit description length

      const fileName = `${sanitizedCategory}_${sanitizedName}_${sanitizedDescription}.${fileExtension}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('templates')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message === 'The resource already exists') {
          setMessage({ type: "error", text: "A template with this name already exists. Please use a different name." });
        } else {
          throw error;
        }
        return;
      }

      setMessage({ type: "success", text: "Template uploaded successfully!" });
      
      // Reset form
      setTemplateName("");
      setTemplateCategory("");
      setTemplateDescription("");
      setSelectedFile(null);
      setPreviewImage(null);
      document.getElementById('template-file-input').value = "";

      // Reload the templates list
      loadTemplates();

    } catch (error) {
      console.error('Error uploading template:', error);
      setMessage({ type: "error", text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const deleteTemplate = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('templates')
        .remove([fileName]);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.name !== fileName));
      setMessage({ type: "success", text: "Template deleted successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error('Error deleting template:', error);
      setMessage({ type: "error", text: "Failed to delete template" });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const inputEvent = { target: { files: [file] } };
      handleFileSelect(inputEvent);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    } else if (fileType === 'application/json') {
      return <FileText size={20} className="text-green-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Template Management</h3>
        <p className="text-gray-600 mt-1">Upload and manage design templates for certificates, awards, and more</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveSection("upload")}
          className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${
            activeSection === "upload"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Upload size={18} className="mr-2" />
          Upload New Template
        </button>
        <button
          onClick={() => setActiveSection("manage")}
          className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${
            activeSection === "manage"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Eye size={18} className="mr-2" />
          Manage Templates ({templates.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'error'
                ? 'bg-red-100 border border-red-200 text-red-700'
                : 'bg-green-100 border border-green-200 text-green-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {activeSection === "upload" ? (
          /* Upload Form */
          <div className="max-w-2xl">
            <div className="space-y-6">
              {/* Template Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name (e.g., Gold Certificate)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {defaultCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of the template (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template File *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    selectedFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                  onClick={() => document.getElementById('template-file-input').click()}
                >
                  <input
                    id="template-file-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.svg,.json,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedFile ? (
                    <div className="text-green-600">
                      <p className="font-medium text-lg">✓ File Selected</p>
                      <p className="text-sm mt-2">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Click to select a different file or drag and drop
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="font-medium text-lg">Click to select or drag and drop</p>
                      <p className="text-sm mt-2">Supports: Images (JPEG, PNG, WebP, SVG), JSON, PDF</p>
                      <p className="text-xs mt-1">Maximum file size: 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {previewImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="border rounded-lg p-4 max-w-xs bg-white">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="max-h-40 mx-auto object-contain"
                    />
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {selectedFile?.name} ({formatFileSize(selectedFile?.size)})
                    </p>
                  </div>
                </div>
              )}

              {selectedFile && !previewImage && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    {getFileIcon(selectedFile.type)}
                    <span className="ml-2 font-medium text-gray-700">
                      {selectedFile.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-1">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={uploadTemplate}
                disabled={uploading || !selectedFile || !templateName.trim() || !templateCategory}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  uploading || !selectedFile || !templateName.trim() || !templateCategory
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading Template...
                  </span>
                ) : (
                  'Upload Template'
                )}
              </button>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Template Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use descriptive names that clearly identify the template purpose</li>
                  <li>• Select appropriate categories for better organization</li>
                  <li>• Include descriptions to help users understand the template usage</li>
                  <li>• Supported formats: Images (JPEG, PNG, WebP, SVG), JSON, PDF</li>
                  <li>• For JSON templates, ensure proper Fabric.js canvas structure</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Recommended image dimensions: 1200x800 pixels or larger</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Manage Existing Templates */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium text-gray-800">
                Available Templates ({templates.length})
              </h4>
              <button
                onClick={loadTemplates}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-lg">No templates found</p>
                <p className="text-gray-400 mt-1">Upload your first template using the "Upload New" tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-gray-50 p-4 flex items-center justify-center">
                      {template.type.startsWith('image/') ? (
                        <img
                          src={template.url}
                          alt={template.displayName}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMTBWMTIwSDE0MFYxMDBIMjBWNjBIODBaIiBmaWxsPSIjOTlBQUFEIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                      ) : (
                        <div className="text-center text-gray-400">
                          {getFileIcon(template.type)}
                          <p className="text-xs mt-2 capitalize">
                            {template.type.split('/')[1] || template.type.split('/')[0]} File
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={template.displayName}>
                            {template.displayName}
                          </p>
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                            {template.category}
                          </span>
                        </div>
                        
                        <div className="flex space-x-1 ml-2">
                          <a
                            href={template.url}
                            download={template.name}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => deleteTemplate(template.name)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {template.description && template.description !== 'No description' && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2" title={template.description}>
                          {template.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-400">
                          {formatFileSize(template.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateUpload;