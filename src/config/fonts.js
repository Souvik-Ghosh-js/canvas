// Your existing system fonts
export const systemFonts = [
  // Sans-serif
  { name: "Arial", font: "Arial", category: "sans-serif", source: "system" },
  { name: "Helvetica", font: "Helvetica", category: "sans-serif", source: "system" },
  { name: "Verdana", font: "Verdana", category: "sans-serif", source: "system" },
  { name: "Tahoma", font: "Tahoma", category: "sans-serif", source: "system" },
  { name: "Trebuchet MS", font: "Trebuchet MS", category: "sans-serif", source: "system" },
  { name: "Gill Sans", font: "Gill Sans", category: "sans-serif", source: "system" },
  { name: "Segoe UI", font: "Segoe UI", category: "sans-serif", source: "system" },
  
  // Serif
  { name: "Times New Roman", font: "Times New Roman", category: "serif", source: "system" },
  { name: "Georgia", font: "Georgia", category: "serif", source: "system" },
  { name: "Palatino Linotype", font: "Palatino Linotype", category: "serif", source: "system" },
  { name: "Book Antiqua", font: "Book Antiqua", category: "serif", source: "system" },
  { name: "Garamond", font: "Garamond", category: "serif", source: "system" },
  
  // Monospace
  { name: "Courier New", font: "Courier New", category: "monospace", source: "system" },
  { name: "Lucida Console", font: "Lucida Console", category: "monospace", source: "system" },
  { name: "Monaco", font: "Monaco", category: "monospace", source: "system" },
  { name: "Consolas", font: "Consolas", category: "monospace", source: "system" },
  
  // Display
  { name: "Impact", font: "Impact", category: "display", source: "system" },
  { name: "Comic Sans MS", font: "Comic Sans MS", category: "display", source: "system" },
  
  // Bengali
  { name: "গলদা", font: "Galada", category: "serif", source: "system" },
  { name: "নাতো সান্স বাঙ্গালী", font: "Noto Sans Bengali", category: "sans-serif", source: "system" },
  { name: "হিন্দি শিলিগুড়ি", font: "Hind Siliguri", category: "sans-serif", source: "system" },
  { name: "আত্মা", font: "Atma", category: "sans-serif", source: "system" },
  { name: "শ্রী", font: "Shree Devanagari 714", category: "serif", source: "system" },
{ name: "বাংলা", font: "Bangla Sangam MN", category: "sans-serif", source: "system" },
{ name: "মিত্র", font: "Mongolian Baiti", category: "serif", source: "system" }, // Often supports Bengali
{ name: "কোহিনূর", font: "Kohinoor Bangla", category: "sans-serif", source: "system" }, // Common on Windows
{ name: "নীলাদ্রি", font: "Nirmala UI", category: "sans-serif", source: "system" },
{ name: "বালু দা ২", font: "Baloo Da 2", category: "sans-serif", source: "google" },
{ name: "হিন্দ শিলিগুড়ি", font: "Hind Siliguri", category: "sans-serif", source: "google" }, // You already have this, marking as google
{ name: "নাতো সান্স বাঙ্গালী", font: "Noto Sans Bengali", category: "sans-serif", source: "google" }, // You already have this, marking as google
{ name: "আদিশীলা", font: "Adishila", category: "sans-serif", source: "google" },
{ name: "চারুকোলা", font: "Charukola", category: "sans-serif", source: "google" },
{ name: "আত্মা", font: "Atma", category: "serif", source: "google" }, // You already have this, marking as google
{ name: "সোলাইমান লিপি", font: "SolaimanLipi", category: "serif", source: "google" }, // Very popular Bengali font
{ name: "লিপিগ্রাম", font: "Lipishree", category: "serif", source: "google" }, // Often listed as Lipishree
{ name: "আনন্দপুর", font: "Anandapur", category: "serif", source: "google" },
{ name: "কালপুরুষ", font: "Kalpurush", category: "display", source: "google" }, // Standard in many government docs
{ name: "মিতালি", font: "Mitali", category: "display", source: "google" },
{ name: "সাগর", font: "Sagar", category: "handwriting", source: "google" }
// A classic Bengali sans // Microsoft's system font for Indic scripts
];

// Your downloaded fonts (with correct filenames)
export const downloadedFonts = [
  // Display/Decorative fonts
  { 
    name: "Awesome", 
    font: "Awesome", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Awesome.otf",
      ttf: "Awesome.ttf"
    }
  },
  { 
    name: "Eagle Horizon", 
    font: "Eagle Horizon", 
    category: "display", 
    source: "downloaded",
    files: {
      ttf: "EagleHorizonP.ttf"
    }
  },
  { 
    name: "Gondens", 
    font: "Gondens", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Gondens DEMO.otf"
    }
  },
  { 
    name: "Mileast", 
    font: "Mileast", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Mileast.otf"
    }
  },
  { 
    name: "Mileast Italic", 
    font: "Mileast Italic", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Mileast Italic.otf"
    }
  },
  { 
    name: "Moralana", 
    font: "Moralana", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Moralana DEMO.otf"
    }
  },
  { 
    name: "Orange Avenue", 
    font: "Orange Avenue", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "OrangeAvenueDEMO-Regular.otf"
    }
  },
  { 
    name: "Orange Avenue Outline", 
    font: "Orange Avenue Outline", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "OrangeAvenueOutlineDEMO-Regular.otf"
    }
  },
  { 
    name: "Perfecto Calligraphy", 
    font: "Perfecto Calligraphy", 
    category: "handwriting", 
    source: "downloaded",
    files: {
      ttf: "PerfectoCalligraphy.ttf"
    }
  },
  { 
    name: "Priestacy", 
    font: "Priestacy", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Priestacy.otf"
    }
  },
  { 
    name: "Rockybilly", 
    font: "Rockybilly", 
    category: "display", 
    source: "downloaded",
    files: {
      ttf: "Rockybilly.ttf"
    }
  },
  { 
    name: "Rustic Roadway", 
    font: "Rustic Roadway", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "RusticRoadway.otf"
    }
  },
  { 
    name: "Transcity", 
    font: "Transcity", 
    category: "display", 
    source: "downloaded",
    files: {
      otf: "Transcity DEMO.otf"
    }
  }
];

// Popular Google Fonts (you can add more)


// Combine all fonts
export const allFonts = [...systemFonts, ...downloadedFonts];

// Group by category
export const fontsByCategory = allFonts.reduce((acc, font) => {
  if (!acc[font.category]) {
    acc[font.category] = [];
  }
  acc[font.category].push(font);
  return acc;
}, {});

// Get unique categories
export const fontCategories = Object.keys(fontsByCategory).sort();