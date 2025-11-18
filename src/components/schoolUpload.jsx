import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/config"; // Adjust path as needed
import { Trash2, Download, Upload, Eye, X } from "lucide-react";

const SchoolUpload = () => {
  const [activeSection, setActiveSection] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [schoolNames, setSchoolNames] = useState({}); // Object to store names for each file
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImages, setPreviewImages] = useState({}); // Object for preview URLs

  // Load school images when component mounts or when activeSection changes to manage
  useEffect(() => {
    if (activeSection === "manage") {
      loadSchoolImages();
    }
  }, [activeSection]);

  const loadSchoolImages = async () => {
    setLoading(true);
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
        createdAt: file.created_at,
        size: file.metadata?.size || 0
      }));

      setSchools(schoolsWithUrls);
    } catch (error) {
      console.error('Error loading school images:', error);
      setMessage({ type: "error", text: "Failed to load school images" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate each file
      const validFiles = [];
      const invalidFiles = [];

      files.forEach(file => {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
          invalidFiles.push(`${file.name} - Invalid file type`);
          return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          invalidFiles.push(`${file.name} - File size exceeds 5MB`);
          return;
        }

        validFiles.push(file);
        
        // Generate preview
        setPreviewImages(prev => ({
          ...prev,
          [file.name]: URL.createObjectURL(file)
        }));

        // Set default school name based on filename
        const defaultName = file.name
          .replace(/\.[^/.]+$/, "") // Remove extension
          .replace(/[_-]/g, " ") // Replace underscores and dashes with spaces
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word

        setSchoolNames(prev => ({
          ...prev,
          [file.name]: defaultName
        }));
      });

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

  const uploadSchoolImages = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: "error", text: "Please select files to upload" });
      return;
    }

    // Check if all files have school names
    const missingNames = selectedFiles.filter(file => !schoolNames[file.name]?.trim());
    if (missingNames.length > 0) {
      setMessage({ type: "error", text: "Please enter school names for all files" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const schoolName = schoolNames[file.name].trim();
        
        // Create a sanitized filename
        const fileExtension = file.name.split('.').pop();
        const sanitizedName = schoolName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_');
        const fileName = `${sanitizedName}.${fileExtension}`;

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('schools')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          if (error.message === 'The resource already exists') {
            throw new Error(`"${schoolName}" already exists. Please use a different name.`);
          } else {
            throw error;
          }
        }

        return { fileName, schoolName };
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
            text: `Some files uploaded successfully, but ${failedUploads.length} failed:\n${errorMessages.join('\n')}` 
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
          text: `Successfully uploaded ${selectedFiles.length} school image(s)!` 
        });
      }

      // Reset form only if all uploads were successful
      if (failedUploads.length === 0) {
        setSelectedFiles([]);
        setSchoolNames({});
        setPreviewImages({});
        document.getElementById('school-file-input').value = "";
      }

      // Reload the school images list if any uploads were successful
      if (successfulUploads.length > 0) {
        loadSchoolImages();
      }

    } catch (error) {
      console.error('Error uploading school images:', error);
      setMessage({ type: "error", text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const removeSelectedFile = (fileName) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setSchoolNames(prev => {
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

  const updateSchoolName = (fileName, name) => {
    setSchoolNames(prev => ({
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

  const getDisplayName = (fileName) => {
    return fileName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[_-]/g, " ") // Replace underscores and dashes with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800">School Images Management</h3>
        <p className="text-gray-600 mt-1">Upload and manage school logos and images</p>
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
          Upload New {selectedFiles.length > 0 && `(${selectedFiles.length})`}
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
          Manage Existing ({schools.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg whitespace-pre-line ${
              message.type === 'error'
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
          /* Upload Form */
          <div className="max-w-4xl">
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Logos/Images *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    selectedFiles.length > 0
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                  onClick={() => document.getElementById('school-file-input').click()}
                >
                  <input
                    id="school-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  
                  {selectedFiles.length > 0 ? (
                    <div className="text-green-600">
                      <p className="font-medium text-lg">✓ {selectedFiles.length} File(s) Selected</p>
                      <p className="text-sm mt-2">
                        Click to select more files or drag and drop
                      </p>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <Upload size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="font-medium text-lg">Click to select or drag and drop</p>
                      <p className="text-sm mt-2">Supports: JPEG, PNG, WebP, SVG</p>
                      <p className="text-xs mt-1">Maximum file size: 5MB per file</p>
                      <p className="text-xs mt-1">You can select multiple files at once</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">
                    Selected Files ({selectedFiles.length})
                  </h4>
                  
                  {selectedFiles.map((file, index) => (
                    <div key={file.name} className="border rounded-lg p-4 bg-white">
                      <div className="flex gap-4">
                        {/* Preview */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 border rounded bg-gray-50 flex items-center justify-center">
                            {previewImages[file.name] ? (
                              <img
                                src={previewImages[file.name]}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No preview</span>
                            )}
                          </div>
                        </div>

                        {/* File Info and Input */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
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

                          {/* School Name Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              School Name for this image *
                            </label>
                            <input
                              type="text"
                              value={schoolNames[file.name] || ''}
                              onChange={(e) => updateSchoolName(file.name, e.target.value)}
                              placeholder="Enter school name (e.g., Sunrise Academy)"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This will be used as the display name and filename
                            </p>
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
                  onClick={uploadSchoolImages}
                  disabled={uploading || selectedFiles.length === 0}
                  className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    uploading || selectedFiles.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading {selectedFiles.length} file(s)...
                    </span>
                  ) : (
                    `Upload ${selectedFiles.length} School Image(s)`
                  )}
                </button>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Upload Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enter the complete school name for each file as it should appear to users</li>
                  <li>• Use high-quality logos or images with transparent backgrounds</li>
                  <li>• Recommended size: 300x300 pixels or larger (square aspect ratio)</li>
                  <li>• Supported formats: JPEG, PNG, WebP, SVG</li>
                  <li>• Maximum file size: 5MB per file</li>
                  <li>• File names will be automatically generated from school names</li>
                  <li>• You can upload multiple school images at once</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Manage Existing Images (unchanged) */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-medium text-gray-800">
                School Images ({schools.length})
              </h4>
              <button
                onClick={loadSchoolImages}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading school images...</p>
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Eye size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-lg">No school images found</p>
                <p className="text-gray-400 mt-1">Upload your first school image using the "Upload New" tab</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {schools.map((school, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                      <img
                        src={school.url}
                        alt={getDisplayName(school.name)}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMTBWMTIwSDE0MFYxMDBIMjBWNjBIODBaIiBmaWxsPSIjOTlBQUFEIi8+Cjwvc3ZnPgo=';
                        }}
                      />
                    </div>
                    
                    <div className="p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate" title={getDisplayName(school.name)}>
                            {getDisplayName(school.name)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(school.size)}
                          </p>
                        </div>
                        
                        <div className="flex space-x-1 ml-2">
                          <a
                            href={school.url}
                            download={school.name}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
                          </a>
                          <button
                            onClick={() => deleteSchoolImage(school.name)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(school.createdAt).toLocaleDateString()}
                      </p>
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

export default SchoolUpload;