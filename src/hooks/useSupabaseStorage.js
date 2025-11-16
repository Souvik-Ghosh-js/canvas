import { useState, useEffect } from "react";
import { supabase } from "../supabase/config";
  // ✅ Upload file to Supabase
import { readPsd, initializeCanvas } from 'ag-psd';
import 'ag-psd/initialize-canvas'; // Initialize canvas for image processing

export const useSupabaseStorage = (bucketName = "logo") => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Fetch all files when the hook loads
  useEffect(() => {
    fetchFiles();
  }, []);

  // ✅ Fetch files from the bucket
  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw error;

      // Generate public URLs
      const filesWithUrls = data.map((file) => {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);
        return { name: file.name, url: publicUrlData.publicUrl };
      });

      setFiles(filesWithUrls);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    }
  };


const uploadFile = async (file) => {
  if (!file) return setError("Please select a file!");
  setUploading(true);
  setError("");

  try {
    let fileToUpload = file;
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    // Convert PSD files to PNG
    if (fileExtension === 'psd') {
      const arrayBuffer = await file.arrayBuffer();
      
      // Read PSD file
      const psd = readPsd(arrayBuffer, {
        skipLayerImageData: false,
        skipCompositeImageData: false,
        skipThumbnail: true
      });

      // Get the composite image (flattened image)
      let canvas;
      if (psd.canvas) {
        canvas = psd.canvas;
      } else if (psd.children && psd.children.length > 0) {
        // Use the first layer if composite image is not available
        canvas = psd.children[0].canvas;
      }

      if (canvas) {
        // Convert canvas to blob
        const blob = await new Promise(resolve => {
          if (canvas.toBlob) {
            canvas.toBlob(resolve, 'image/png');
          } else {
            // Fallback for Node.js environment
            const dataURL = canvas.toDataURL('image/png');
            fetch(dataURL)
              .then(res => res.blob())
              .then(resolve);
          }
        });

        // Create new file with PNG extension
        const newFileName = fileName.replace(/\.psd$/i, '.png');
        fileToUpload = new File([blob], newFileName, { type: 'image/png' });
      } else {
        throw new Error("Could not extract image from PSD file");
      }
    }

    // Upload the file (original or converted)
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileToUpload.name, fileToUpload);

    if (error) throw error;

    await fetchFiles(); // refresh files after upload
  } catch (err) {
    console.error("Upload error:", err);
    setError(err.message);
  } finally {
    setUploading(false);
  }
};

  // 🗑️ Optional: Delete file from bucket
  const deleteFile = async (fileName) => {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) throw error;
      await fetchFiles();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
    }
  };

  return {
    files,
    uploading,
    error,
    uploadFile,
    fetchFiles,
    deleteFile,
  };
};
