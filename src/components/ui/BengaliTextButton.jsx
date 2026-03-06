import React from 'react';
import { Languages } from 'lucide-react';

function BengaliTextButton({ onClick, isVisible }) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 flex items-center gap-2 font-medium"
      title="Convert to Bengali"
    >
      <Languages size={18} />
      <span>বাংলা</span>
    </button>
  );
}

export default BengaliTextButton;