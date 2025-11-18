import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/config";
import { Trash2, Download, Upload, Eye, Image, X } from "lucide-react";

const ElementsUpload = () => {
  const [activeSection, setActiveSection] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [elementNames, setElementNames] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeSection === "manage") {
      loadElements();
    }
  }, [activeSection]);

  const loadElements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('element')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) throw error;

      const elementsWithUrls = await Promise.all(
        data.map(async (file) => {
          const url = supabase.storage.from('element').getPublicUrl(file.name).data.publicUrl;

          // Extract name from filename (remove extension)
          const displayName = file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase());

          return {
            name: file.name,
            url: url,
            displayName: displayName,
            createdAt: file.created_at,
            size: file.metadata?.size || 0,
            type: file.metadata?.mimetype || 'image/png',
          };
        })
      );

      setElements(elementsWithUrls);
    } catch (error) {
      console.error('Error loading elements:', error);
      setMessage({ type: "error", text: "Failed to load elements" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = [];
      const invalidFiles = [];

      for (const file of files) {
        // Validate file type - only images
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/svg+xml",
          "image/webp",
          "image/gif"
        ];

        if (!validTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} - Only image files are allowed`);
          continue;
        }

        // Validate file size (max 2MB for elements)
        if (file.size > 2 * 1024 * 1024) {
          invalidFiles.push(`${file.name} - File size exceeds 2MB`);
          continue;
        }

        // Create preview for image files
        setPreviewImages(prev => ({
          ...prev,
          [file.name]: URL.createObjectURL(file)
        }));

        validFiles.push(file);

        // Set default name based on filename
        const defaultName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase());

        setElementNames(prev => ({
          ...prev,
          [file.name]: defaultName
        }));
      }

      if (invalidFiles.length > 0) {
        setMessage({
          type: "error",
          text: `Some files were rejected:\n${invalidFiles.join('\n')}`
        });
      }

      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        setMessage({ type: "", text: "" });
      }
    }
  };

  const uploadElements = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: "error", text: "Please select files to upload" });
      return;
    }

    // Check if all files have names
    const missingNames = selectedFiles.filter(file => !elementNames[file.name]?.trim());

    if (missingNames.length > 0) {
      setMessage({ type: "error", text: "Please enter names for all elements" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const elementName = elementNames[file.name].trim();

        const fileExtension = file.name.split('.').pop();
        const sanitizedName = elementName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_');

        const fileName = `${sanitizedName}.${fileExtension}`;

        const { data, error } = await supabase.storage
          .from('element')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          if (error.message === 'The resource already exists') {
            throw new Error(`"${elementName}" already exists. Please use a different name.`);
          } else {
            throw error;
          }
        }

        return { fileName, elementName };
      });

      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads = results.filter(result => result.status === 'fulfilled');
      const failedUploads = results.filter(result => result.status === 'rejected');

      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map((result, index) =>
          `${selectedFiles[index]?.name}: ${result.reason.message}`
        );

        if (successfulUploads.length > 0) {
          setMessage({
            type: "warning",
            text: `Some elements uploaded successfully, but ${failedUploads.length} failed:\n${errorMessages.join('\n')}`
          });
        } else {
          setMessage({
            type: "error",
            text: `Upload failed:\n${errorMessages.join('\n')}`
          });
        }
      } else {
        setMessage({
          type: "success",
          text: `Successfully uploaded ${selectedFiles.length} element(s)!`
        });
      }

      // Reset form only if all uploads were successful
      if (failedUploads.length === 0) {
        setSelectedFiles([]);
        setElementNames({});
        setPreviewImages({});
        document.getElementById('element-file-input').value = "";
      }

      // Reload the elements list if any uploads were successful
      if (successfulUploads.length > 0) {
        loadElements();
      }

    } catch (error) {
      console.error('Error uploading elements:', error);
      setMessage({ type: "error", text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));

    // Clean up related state
    setElementNames(prev => {
      const newNames = { ...prev };
      delete newNames[fileName];
      return newNames;
    });

    setPreviewImages(prev => {
      const newPreviews = { ...prev };
      if (newPreviews[fileName]) {
        URL.revokeObjectURL(newPreviews[fileName]);
        delete newPreviews[fileName];
      }
      return newPreviews;
    });
  };

  const updateElementName = (fileName, name) => {
    setElementNames(prev => ({
      ...prev,
      [fileName]: name
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const inputEvent = { target: { files } };
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

  const previewElement = (element) => {
    window.open(element.url, '_blank');
  };

  const deleteElement = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this element? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('element')
        .remove([fileName]);

      if (error) throw error;

      setElements(prev => prev.filter(element => element.name !== fileName));
      setMessage({ type: "success", text: "Element deleted successfully!" });

      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error('Error deleting element:', error);
      setMessage({ type: "error", text: "Failed to delete element" });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800">Elements Management</h3>
        <p className="text-gray-600 mt-1">Upload and manage design elements (images only)</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveSection("upload")}
          className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${activeSection === "upload"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          <Upload size={18} className="mr-2" />
          Upload New {selectedFiles.length > 0 && `(${selectedFiles.length})`}
        </button>
        <button
          onClick={() => setActiveSection("manage")}
          className={`flex items-center px-6 py-3 font-medium border-b-2 transition-colors ${activeSection === "manage"
              ? "border-blue-500 text-blue-600 bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          <Eye size={18} className="mr-2" />
          Manage Elements ({elements.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg whitespace-pre-line ${message.type === 'error'
                ? 'bg-red-100 border border-red-200 text-red-700'
                : message.type === 'warning'
                  ? 'bg-yellow-100 border border-yellow-200 text-yellow-700'
                  : 'bg-green-100 border border-green-200 text-green-700'
              }`}
          >
            {message.text}
          </div>
        )}

        {activeSection === "upload" ? (
          <div className="max-w-4xl">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Element Images *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${selectedFiles.length > 0
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}
                  onClick={() => document.getElementById('element-file-input').click()}
                >
                  <input
                    id="element-file-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />

                  {selectedFiles.length > 0 ? (
                    <div className="text-green-600">
                      <p className="font-medium text-lg">✓ {selectedFiles.length} Image(s) Selected</p>
                      <p className="text-sm mt-2">
                        Click to select more images or drag and drop
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="font-medium text-lg">Click to select or drag and drop</p>
                      <p className="text-sm mt-2">Supports: JPG, PNG, WEBP, GIF, SVG</p>
                      <p className="text-xs mt-1">Maximum file size: 2MB per file</p>
                      <p className="text-xs mt-1">You can select multiple files at once</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-6">
                  <h4 className="font-medium text-gray-800">
                    Selected Images ({selectedFiles.length})
                  </h4>

                  {selectedFiles.map((file, index) => (
                    <div key={file.name} className="border rounded-lg p-4 bg-white">
                      <div className="flex gap-4">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 border rounded bg-gray-50 flex items-center justify-center">
                            {previewImages[file.name] ? (
                              <img
                                src={previewImages[file.name]}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <div className="text-center text-gray-400">
                                <Image size={20} className="text-blue-500" />
                                <p className="text-xs mt-1 capitalize">
                                  {file.type.split('/')[1]}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* File Info and Inputs */}
                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)} • {file.type}
                              </p>
                            </div>
                            <button
                              onClick={() => removeSelectedFile(file.name)}
                              className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Remove file"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Element Name Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Element Name *
                            </label>
                            <input
                              type="text"
                              value={elementNames[file.name] || ''}
                              onChange={(e) => updateElementName(file.name, e.target.value)}
                              placeholder="Enter element name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {selectedFiles.length > 0 && (
                <button
                  onClick={uploadElements}
                  disabled={uploading || selectedFiles.length === 0}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${uploading || selectedFiles.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                    }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading {selectedFiles.length} element(s)...
                    </span>
                  ) : (
                    `Upload ${selectedFiles.length} Element(s)`
                  )}
                </button>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Element Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Upload design elements like icons, borders, badges, etc.</li>
                  <li>• Supported formats: JPG, PNG, WEBP, GIF, SVG</li>
                  <li>• Maximum file size: 2MB per file</li>
                  <li>• Use transparent backgrounds for PNG/SVG elements</li>
                  <li>• Recommended size: 200x200 pixels or larger for quality</li>
                  <li>• You can upload multiple elements at once</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Manage Existing Elements */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium text-gray-800">
                Available Elements ({elements.length})
              </h4>
              <button
                onClick={loadElements}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading elements...</p>
              </div>
            ) : elements.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Image size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-lg">No elements found</p>
                <p className="text-gray-400 mt-1">Upload your first element using the "Upload New" tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {elements.map((element, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                      <img
                        src={element.url}
                        alt={element.displayName}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMTBWMTIwSDE0MFYxMDBIMjBWNjBIODBaIiBmaWxsPSIjOTlBQUFEIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>

                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={element.displayName}>
                            {element.displayName}
                          </p>
                        </div>

                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => previewElement(element)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <a
                            href={element.url}
                            download={element.name}
                            className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => deleteElement(element.name)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-400">
                          {formatFileSize(element.size)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(element.createdAt).toLocaleDateString()}
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

export default ElementsUpload;