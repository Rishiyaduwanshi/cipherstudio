"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import useProjectStore from "@/stores/projectStore";

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    visibility: "private",
    settings: { framework: "react", autoSave: true },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Import initial files
      const { initialFiles } = await import("@/data/initialProject-react");

      const created = await useProjectStore.getState().createProject({
        ...newProject,
        files: initialFiles, // Use the boilerplate files
        settings: {
          ...newProject.settings,
          framework: "react", // Ensure framework is set
          autoSave: true,
        },
      });

      // Reset form
      setNewProject({
        name: "",
        description: "",
        visibility: "private",
        settings: { framework: "react", autoSave: true },
      });

      toast.success("Project created successfully with React boilerplate!");
      onSuccess?.(created); // Callback with created project
      onClose(); // Close modal
    } catch (error) {
      toast.error(error.message || "Failed to create project");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">
          Create New Project
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Project description (optional)"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Visibility
              </label>
              <select
                value={newProject.visibility}
                onChange={(e) =>
                  setNewProject((p) => ({ ...p, visibility: e.target.value }))
                }
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
