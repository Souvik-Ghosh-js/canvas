import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

function BengaliKeyboardModal({ isOpen, onClose, onInsert }) {
  const [englishText, setEnglishText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Google Input Tools API
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);

      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
        text
      )}&itc=bn-t-i0-und&num=8&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;

      const res = await fetch(url);
      const data = await res.json();

      if (data[0] === "SUCCESS") {
        setSuggestions(data[1][0][1]);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Transliteration error", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce typing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(englishText);
    }, 250);

    return () => clearTimeout(timer);
  }, [englishText]);

  const handleInsert = (text) => {
    if (!text) return;

    onInsert(text);
    setEnglishText("");
    setSuggestions([]);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      handleInsert(suggestions[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Bengali Keyboard</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">

          {/* English Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type in English
            </label>

            <input
              type="text"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g., ami banglay likhchi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Suggestions */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bengali Suggestions
            </label>

            <div className="flex flex-wrap gap-2 min-h-[40px]">

              {loading && (
                <span className="text-sm text-gray-400">
                  Translating...
                </span>
              )}

              {!loading && suggestions.length === 0 && (
                <span className="text-gray-400">—</span>
              )}

              {suggestions.map((word, i) => (
                <button
                  key={i}
                  onClick={() => handleInsert(word)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg"
                >
                  {word}
                </button>
              ))}

            </div>
          </div>

          {/* Examples */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Examples:</p>

            <div className="flex flex-wrap gap-2">
              {["ami", "tumi", "bangla", "bhalo", "kemon acho"].map((example) => (
                <button
                  key={example}
                  onClick={() => setEnglishText(example)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={() => handleInsert(suggestions[0])}
            disabled={!suggestions.length}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50"
          >
            Insert Bengali Text
          </button>
        </div>

      </div>
    </div>
  );
}

export default BengaliKeyboardModal;