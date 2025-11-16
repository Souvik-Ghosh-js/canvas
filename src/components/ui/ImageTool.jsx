import React from "react";
const images = [
  {
    url: "https://images.unsplash.com/photo-1495594059084-33752639b9c3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YW5pbWFsfGVufDB8MnwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
  },
  {
    url: "https://images.unsplash.com/photo-1588167056547-c183313da47c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YW5pbWFsfGVufDB8MnwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
  },
  {
    url: "https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=896",
  },
  {
    url: "https://images.unsplash.com/photo-1732705412345-0697a01d168b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGFuaW1hbHxlbnwwfDJ8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
  },
  {
    url: "https://images.unsplash.com/photo-1634311762173-3b84e4c87ac6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFuaW1hbHxlbnwwfDJ8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
  },
  {
    url: "https://images.unsplash.com/photo-1611915387288-fd8d2f5f928b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGFuaW1hbHxlbnwwfDJ8MHx8fDA%3D&auto=format&fit=crop&q=60&w=600",
  },
];
function ImageTool({ action }) {
  return (
    <div>
      <section>
        <h1>Select Images</h1>
        <section className="flex flex-wrap gap-1 items-center w-full justify-center mt-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              className="h-20 w-20 cursor-pointer"
              onClick={() => {
                action(image.url);
              }}
            />
          ))}
        </section>
      </section>
    </div>
  );
}

export default ImageTool;
