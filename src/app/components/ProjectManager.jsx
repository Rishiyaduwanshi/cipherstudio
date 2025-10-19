"use client"
import React, { useState } from "react";
import { initialFiles } from '@/app/data/initialProject-react';

export default function ProjectManager({ project, setProject, onNewProject, onLoadProject }) {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);

  const handleNewProject = () => {
    if (projectName.trim()) {
      const newProject = {
        name: projectName,
        files: initialFiles
      };
      
      setProject(newProject);
      localStorage.setItem('cipherstudio-project', JSON.stringify(newProject));
      setProjectName('');
      setShowProjectModal(false);
    }
  };

  const loadSavedProjects = () => {
    const projects = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cipherstudio-project-')) {
        const project = JSON.parse(localStorage.getItem(key));
        projects.push({ key, ...project });
      }
    }
    setSavedProjects(projects);
    setShowLoadModal(true);
  };

  const saveProjectAs = () => {
    const projectId = `cipherstudio-project-${Date.now()}`;
    localStorage.setItem(projectId, JSON.stringify(project));
    alert(`Project "${project.name}" saved successfully!`);
  };

  const loadProject = (projectKey) => {
    const savedProject = JSON.parse(localStorage.getItem(projectKey));
    setProject(savedProject);
    localStorage.setItem('cipherstudio-project', JSON.stringify(savedProject));
    setShowLoadModal(false);
  };

  return (
    <>
      {/* Project Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowProjectModal(true)}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          New Project
        </button>
        <button
          onClick={saveProjectAs}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Save As
        </button>
        <button
          onClick={loadSavedProjects}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          Load Project
        </button>
      </div>

      {/* New Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-white text-lg mb-4">Create New Project</h3>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full p-2 bg-gray-700 text-white rounded mb-4"
              onKeyUp={(e) => e.key === 'Enter' && handleNewProject()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Project Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-white text-lg mb-4">Load Saved Project</h3>
            {savedProjects.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No saved projects found</p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((proj) => (
                  <div
                    key={proj.key}
                    onClick={() => loadProject(proj.key)}
                    className="p-3 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    <h4 className="text-white font-medium">{proj.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {Object.keys(proj.files).length} files
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}