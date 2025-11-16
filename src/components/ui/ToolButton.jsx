import React from "react";

function ToolButton({ text, icon, onToolClick }) {
  return (
    <button
      className="px-3 h-11 hover:bg-gray-100 transition-all flex gap-3 text-md items-center w-full cursor-pointer"
      onClick={() => {
        onToolClick(text);
      }}
    >
      {icon}
      {text}
    </button>
  );
}

export default ToolButton;
