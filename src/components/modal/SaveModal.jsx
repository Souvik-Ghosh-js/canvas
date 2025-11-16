// components/modal/SaveModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SaveModal = ({ isOpen, onClose, onSave, currentProject, defaultName }) => {
  const [projectName, setProjectName] = useState('');
  const [saveAsNew, setSaveAsNew] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProjectName(defaultName);
      setSaveAsNew(false);
    }
  }, [isOpen, defaultName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }
    onSave(projectName.trim(), saveAsNew);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {currentProject && !saveAsNew ? 'Update Project' : 'Save Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
              autoFocus
            />
          </div>

          {currentProject && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={saveAsNew}
                  onChange={(e) => setSaveAsNew(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  Save as new project (creates a copy)
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentProject && !saveAsNew ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;