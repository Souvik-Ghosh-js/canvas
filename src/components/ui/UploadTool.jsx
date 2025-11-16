import { FabricImage } from "fabric";
import React from "react";
import { FaUpload } from "react-icons/fa6";

function UploadTool({ canvas }) {
  const handleFile = (e) => {
    const image = e.target.files[0];

    if (!image) {
      return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async function (event) {
      const dataURL = event.target.result;
      const img = await FabricImage.fromURL(dataURL, {
        crossOrigin: "anonymous",
      });
      img.set({
        left: 100,
        top: 100,
        scaleX: 0.3,
        scaleY: 0.3,
      });

      canvas.add(img);
      canvas.renderAll();
    };
  };

  return (
    <div>
      <section>
        <h1 className=" font-semibold mb-2">Upload from Computer</h1>
        <hr className="border-gray-300" />
      </section>
      <input
        type="file"
        id="input_file"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => {
          document.querySelector("#input_file").click();
        }}
        className="w-full bg-amber-300 flex justify-center items-center text-xl py-2 rounded-full gap-2 mt-4 cursor-pointer"
      >
        {" "}
        <FaUpload /> Upload
      </button>
    </div>
  );
}

export default UploadTool;
