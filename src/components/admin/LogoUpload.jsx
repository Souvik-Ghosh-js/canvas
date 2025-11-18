import React, { useRef, useState } from "react";
import { supabase } from "../../supabase/config";
import { useSupabaseStorage } from "../../hooks/useSupabaseStorage";

const SimpleFileUpload = () => {
  const { files, uploading, error, uploadFile, deleteFile } =
    useSupabaseStorage("logo");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFilesArray = Array.from(event.target.files);
    if (selectedFilesArray.length > 0) {
      setSelectedFiles(selectedFilesArray);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      // Upload all selected files
      for (const file of selectedFiles) {
        await uploadFile(file);
        console.log("Uploading file:", file.name);
      }
      
      alert(`Uploading ${selectedFiles.length} file(s)`);
      
      // Reset after upload
      setSelectedFiles([]);
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = (indexToRemove) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <section>
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        {/* Hidden file input - now with multiple attribute */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        {/* File info */}
        <div className="flex-1 min-w-0">
          {selectedFiles.length > 0 ? (
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                {selectedFiles.length} file(s) selected:
              </p>
              <div className="max-h-20 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                    <span className="truncate">📄 {file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No files selected</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Choose Files
          </button>

          <button
            onClick={handleUpload}
            disabled={!selectedFiles.length || uploading}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading..." : `Upload (${selectedFiles.length})`}
          </button>
        </div>
      </div>

      {/* Uploaded files grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 mt-5">
        {files.length > 0 ? (
          files.map((f) => (
            <div
              key={f.name}
              className="border bg-white rounded-lg shadow hover:shadow-lg transition p-2 text-center"
            >
              <section className="w-full flex justify-center">
                {f.url.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-30 h-30 rounded mb-2"
                  />
                ) : (
                  <div className="h-40 flex items-center justify-center bg-gray-100 text-gray-500">
                    📄 File
                  </div>
                )}
              </section>
              <div className="flex justify-between mt-2 px-2">
                <button
                  className="text-white text-xs rounded-sm w-full py-1 hover:bg-red-700 bg-red-600 cursor-pointer"
                  onClick={() => deleteFile(f.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No files uploaded yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default SimpleFileUpload;