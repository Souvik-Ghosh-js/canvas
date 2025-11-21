import React, { useState } from "react";

function EmailModal({ isOpen, onClose, onSendEmail, fileName = "design", canvasList = [], activePage = 1 }) {
  const [projectName, setProjectName] = useState(fileName);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [exportOption, setExportOption] = useState("current"); // "current" or "all"

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setMessage("Please enter a project name");
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    try {
      await onSendEmail(
        'mohinidotmohini@gmail.com', 
        projectName.trim(),
        exportOption,
        canvasList,
        activePage
      );
      setMessage(`Email sent successfully to mohinidotmohini@gmail.com with ${exportOption === 'current' ? 'current page' : 'all pages'}!`);
      setTimeout(() => {
        onClose();
        setProjectName(fileName);
        setMessage("");
        setExportOption("current");
      }, 2000);
    } catch (error) {
      setMessage(error.message || "Failed to send email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Send Project via Email</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            Email will be sent to: <span className="font-bold">mohinidotmohini@gmail.com</span>
          </p>
          {canvasList.length > 1 && (
            <p className="text-sm text-blue-600 mt-1">
              Project has {canvasList.length} pages
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project name"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {canvasList.length > 1 && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Export Option
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="current"
                    checked={exportOption === "current"}
                    onChange={(e) => setExportOption(e.target.value)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm">Current Page Only (Page {activePage})</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={exportOption === "all"}
                    onChange={(e) => setExportOption(e.target.value)}
                    className="mr-2"
                    disabled={isLoading}
                  />
                  <span className="text-sm">All Pages ({canvasList.length} pages)</span>
                </label>
              </div>
            </div>
          )}
          
          {message && (
            <div className={`p-3 rounded-md mb-4 ${
              message.includes("success") 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                `Send ${exportOption === 'all' ? 'All Pages' : 'Page'}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailModal;