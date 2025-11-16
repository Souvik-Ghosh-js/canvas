import React from "react";
import { FaSquareFull, FaSquare, FaCircle } from "react-icons/fa";
import { IoTriangleSharp } from "react-icons/io5";
function ShapeTool({ action }) {
  return (
    <section>
      <h1 className=" font-semibold mb-2">Select Shape</h1>
      <hr className="border-gray-300" />

      <section className="flex justify-between items-center mt-2 flex-wrap">
        <FaSquareFull
          size={45}
          className="cursor-pointer"
          onClick={action.addSquare}
        />
        <FaSquare
          size={50}
          className="cursor-pointer"
          onClick={action.addRounded}
        />
        <FaCircle
          size={50}
          className="cursor-pointer"
          onClick={action.addCircle}
        />
        <IoTriangleSharp
          size={50}
          className="cursor-pointer"
          onClick={action.addTriangle}
        />
      </section>
    </section>
  );
}

export default ShapeTool;
