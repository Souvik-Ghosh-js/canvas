import Inputs from "./ui/Inputs";
const fonts = [
  // System fonts
  { name: "Arial", font: "Arial", category: "sans-serif" },
  { name: "Helvetica", font: "Helvetica", category: "sans-serif" },
  { name: "Verdana", font: "Verdana", category: "sans-serif" },
  { name: "Tahoma", font: "Tahoma", category: "sans-serif" },
  { name: "Trebuchet MS", font: "Trebuchet MS", category: "sans-serif" },
  { name: "Gill Sans", font: "Gill Sans", category: "sans-serif" },
  { name: "Segoe UI", font: "Segoe UI", category: "sans-serif" },

  { name: "Times New Roman", font: "Times New Roman", category: "serif" },
  { name: "Georgia", font: "Georgia", category: "serif" },
  { name: "Palatino Linotype", font: "Palatino Linotype", category: "serif" },
  { name: "Book Antiqua", font: "Book Antiqua", category: "serif" },
  { name: "Garamond", font: "Garamond", category: "serif" },

  { name: "Courier New", font: "Courier New", category: "monospace" },
  { name: "Lucida Console", font: "Lucida Console", category: "monospace" },
  { name: "Monaco", font: "Monaco", category: "monospace" },
  { name: "Consolas", font: "Consolas", category: "monospace" },

  { name: "Impact", font: "Impact", category: "display" },
  { name: "Comic Sans MS", font: "Comic Sans MS", category: "display" },
  { name: "গলদা ", font: "Galada", category: "serif" },
  {
    name: "নাতো সান্স বাঙ্গালী",
    font: "Noto Sans Bengali",
    category: "sans-serif",
  },
  {
    name: "হিন্দি শিলিগুড়ি ",
    font: "Hind Siliguri",
    category: "sans-serif",
  },
  {
    name: "আত্মা",
    font: "Atma",
    category: "sans-serif",
  },
];
function TextProperties({
  fontSize,
  onFontSizeChange,
  fontWeight,
  onFontChange,
  color,
  onColorChange,
  font,
  onFontWeightChange,
  textAlign,
  onTextAlign,
  onOpacityChange,
  opacity,
}) {
  return (
    <div className="px-4">
      <section className="flex flex-col mb-2">
        <label htmlFor="" className="font-bold">
          Typography
        </label>
        <section>
          <select
            className="bg-gray-100 text-sm py-1 px-1 border-2 border-black-200 mt-2 w-full"
            onChange={onFontChange}
          >
            <option className="hidden">{font}</option>
            {fonts.map((font, index) => (
              <option
                key={index}
                value={font.font}
                style={{ fontFamily: font.font }}
              >
                {font.name}
              </option>
            ))}
          </select>
          <section className="flex justify-between items-center mt-3 mb-3">
            <select
              onChange={onFontWeightChange}
              className="bg-gray-100 text-sm py-1 px-1 border-2 border-black-200 w-1/2  h-8"
            >
              <option className="hidden">
                {fontWeight == 300 && "Light"}
                {fontWeight == 400 && "Regular"}
                {fontWeight == 500 && "Medium"}
                {fontWeight == 600 && "Semi-Bold"}
                {fontWeight == 700 && "Bold"}
                {fontWeight == 800 && "Extra-Bold"}
              </option>
              <option value={300}>Light</option>
              <option value={400}>Regular</option>
              <option value={500}>Medium</option>
              <option value={600}>Semi-Bold</option>
              <option value={700}>Bold</option>
              <option value={800}>Extra-Bold</option>
            </select>

            <input
              type="number"
              className="bg-gray-100 outline-0 w-[70px] h-8 ml-2 pl-2"
              value={fontSize}
              onChange={onFontSizeChange}
            />
          </section>
          <section className="flex gap-2 mb-3">
            <Inputs
              icon="Fill"
              type="color"
              value={color}
              onChange={onColorChange}
            />
            <select
              className="bg-gray-100 text-sm capitalize py-1 px-1 border-2 border-black-200 w-1/2  h-8"
              onChange={onTextAlign}
            >
              <option className="hidden">{textAlign}</option>
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </section>
          <Inputs
            icon="O"
            type="number"
            value={opacity * 100}
            onChange={onOpacityChange}
          />
        </section>
      </section>
    </div>
  );
}

export default TextProperties;
