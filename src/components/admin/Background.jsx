import React, { useRef, useState } from "react";
import { supabase } from "../../supabase/config";
import { useSupabaseStorage } from "../../hooks/useSupabaseStorage";
const BackgroundUpload = () => {
  const { files, uploading, error, uploadFile, deleteFile } =
    useSupabaseStorage("background");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      // Add your upload logic here
      uploadFile(selectedFile);
      console.log("Uploading file:", selectedFile.name);
      alert(`Uploading: ${selectedFile.name}`);
      // Reset after upload
      setSelectedFile(null);
      fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section>
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File info */}
        <div className="flex-1 min-w-0">
          {selectedFile ? (
            <p className="text-sm text-gray-700 truncate">
              📄 {selectedFile.name}
            </p>
          ) : (
            <p className="text-sm text-gray-500">No file selected</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Choose File
          </button>

          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading" : "Upload"}
          </button>
        </div>
      </div>
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

export default BackgroundUpload;
