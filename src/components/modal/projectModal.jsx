import { useState, useEffect } from 'react';
import { loadProjectFromSupabase, deleteProjectFromSupabase } from '../../utils/supabaseUtils';
import { IoIosCloseCircle } from "react-icons/io";

const ProjectsModal = ({ isOpen, onClose, projects, onProjectSelect, canvas }) => {
  const [loading, setLoading] = useState(false);

  const handleProjectSelect = async (project) => {
    setLoading(true);
    const result = await loadProjectFromSupabase(project.file_path);
    
    if (result.success) {
      onProjectSelect(result.data);
      onClose();
    } else {
      alert('Error loading project: ' + result.error);
    }
    setLoading(false);
  };

  const handleDeleteProject = async (project, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const result = await deleteProjectFromSupabase(project.id, project.file_path);
    
    if (result.success) {
      // Remove from local projects list
      const updatedProjects = projects.filter(p => p.id !== project.id);
      onProjectSelect(updatedProjects);
      alert('Project deleted successfully!');
    } else {
      alert('Error deleting project: ' + result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoIosCloseCircle size={24} />
          </button>
        </div>

        {loading && <div className="text-center">Loading...</div>}

        {projects.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No projects found. Create and save your first project!
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleProjectSelect(project)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{project.project_name}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project, e)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsModal;