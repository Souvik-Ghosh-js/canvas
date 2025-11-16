import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/config"; // Adjust path as needed
import { Trash2, Download, Upload, Eye } from "lucide-react";

const SchoolUpload = () => {
  const [activeSection, setActiveSection] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

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
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: "error", text: "Please select a valid image file (JPEG, PNG, WebP, SVG)" });
        setSelectedFile(null);
        setPreviewImage(null);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be less than 5MB" });
        setSelectedFile(null);
        setPreviewImage(null);
        return;
      }

      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setMessage({ type: "", text: "" });
    }
  };

  const uploadSchoolImage = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select a file to upload" });
      return;
    }

    if (!schoolName.trim()) {
      setMessage({ type: "error", text: "Please enter a school name" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    try {
      // Create a sanitized filename
      const fileExtension = selectedFile.name.split('.').pop();
      const sanitizedName = schoolName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      const fileName = `${sanitizedName}.${fileExtension}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('schools')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message === 'The resource already exists') {
          setMessage({ type: "error", text: "A school with this name already exists. Please use a different name." });
        } else {
          throw error;
        }
        return;
      }

      setMessage({ type: "success", text: "School image uploaded successfully!" });
      setSchoolName("");
      setSelectedFile(null);
      setPreviewImage(null);
      document.getElementById('school-file-input').value = "";

      // Reload the school images list
      loadSchoolImages();

    } catch (error) {
      console.error('Error uploading school image:', error);
      setMessage({ type: "error", text: `Upload failed: ${error.message}` });
    } finally {
      setUploading(false);
    }
  };

  const deleteSchoolImage = async (fileName) => {
    if (!window.confirm('Are you sure you want to delete this school image? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('schools')
        .remove([fileName]);

      if (error) throw error;

      setSchools(prev => prev.filter(school => school.name !== fileName));
      setMessage({ type: "success", text: "School image deleted successfully!" });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error('Error deleting school image:', error);
      setMessage({ type: "error", text: "Failed to delete school image" });
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
          Upload New
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
              {/* School Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Enter school name (e.g., Sunrise Academy)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used to generate the filename and display name
                </p>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Logo/Image *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    selectedFile 
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
                      <p className="text-sm mt-2">Supports: JPEG, PNG, WebP, SVG</p>
                      <p className="text-xs mt-1">Maximum file size: 5MB</p>
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

              {/* Upload Button */}
              <button
                onClick={uploadSchoolImage}
                disabled={uploading || !selectedFile || !schoolName.trim()}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  uploading || !selectedFile || !schoolName.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </span>
                ) : (
                  'Upload School Image'
                )}
              </button>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Upload Guidelines:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Enter the complete school name as it should appear to users</li>
                  <li>• Use high-quality logos or images with transparent backgrounds</li>
                  <li>• Recommended size: 300x300 pixels or larger (square aspect ratio)</li>
                  <li>• Supported formats: JPEG, PNG, WebP, SVG</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• File names will be automatically generated from school names</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Manage Existing Images */
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