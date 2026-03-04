import { useState, useEffect } from "react";
import Inputs from "./ui/Inputs";
import { allFonts, fontCategories } from "../config/fonts";

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
  onCurveChange
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [localFont, setLocalFont] = useState(font); // Add local state

  // Update local state when prop changes
  useEffect(() => {
    setLocalFont(font);
  }, [font]);

  // Filter fonts based on search and category
  const filteredFonts = allFonts.filter(fontItem => {
    const matchesSearch = fontItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fontItem.font.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || fontItem.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle font selection with loading
  const handleFontChange = (e) => {
    const selectedFont = e.target.value;
    const fontData = allFonts.find(f => f.font === selectedFont);
    
    // Update local state immediately for responsive UI
    setLocalFont(selectedFont);
    
    // Call parent handler
    onFontChange(e);
  };

  // Load initial font if it's a Google Font
  useEffect(() => {
    if (font) {
      const currentFont = allFonts.find(f => f.font === font);
    }
  }, [font]);

  return (
    <div className="px-3 ">
      <section className="flex flex-col mb-2">
        <label className="font-bold">Typography</label>
        
        {/* Search input */}
        <input
          type="text"
          placeholder="Search fonts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-100 text-sm py-1 px-2 border-2 border-black-200 mt-2 w-full"
        />
        
        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-100 text-sm py-1 px-1 border-2 border-black-200 mt-2 w-full"
        >
          <option value="all">All Categories</option>
          {fontCategories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        
        <section>
          <select
            className="bg-gray-100 text-sm py-1 px-1 border-2 border-black-200 mt-2 w-full"
            onChange={handleFontChange}
            value={localFont} // Use local state here instead of prop
            size="5"
          >
            {filteredFonts.map((fontItem, index) => (
              <option
                key={index}
                value={fontItem.font}
                style={{ fontFamily: fontItem.font }}
              >
                {fontItem.name} {fontItem.source !== "system" && `(${fontItem.source})`}
              </option>
            ))}
          </select>
          
          <section className="flex justify-between items-center mt-3 mb-3">
            <select
              onChange={onFontWeightChange}
              value={fontWeight}
              className="bg-gray-100 text-sm py-1 px-1 border-2 border-black-200 w-1/2 h-8"
            >
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
              className="bg-gray-100 text-sm capitalize py-1 px-1 border-2 border-black-200 w-1/2 h-8"
              onChange={onTextAlign}
              value={textAlign}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
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
        
        <section className="mt-3">
          <label className="text-xs font-semibold text-gray-600">
            Curve
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={0}
            onChange={onCurveChange}
            className="w-full"
          />
        </section>
      </section>
    </div>
  );
}

export default TextProperties;