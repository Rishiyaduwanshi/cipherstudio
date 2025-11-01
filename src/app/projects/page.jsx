"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/authStore";
import useProjectStore from "@/stores/projectStore";
import { toast } from "react-toastify";
import { FiTrash2, FiEdit3, FiPlus, FiGlobe, FiLock } from "react-icons/fi";
import CreateProjectModal from "@/components/CreateProjectModal";
import { ROUTES, UI } from "@/constants";

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(ROUTES.SIGNIN);
      return;
    }

    // Load projects when authenticated
    fetchProjects().catch((err) =>
      toast.error(err.message || "Failed to load projects"),
    );
  }, [isAuthenticated, router, fetchProjects]);

  const handleDeleteProject = async (projectId) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error(error.message || "Failed to delete project");
    }
  };

  const openInIDE = (projectId) => {
    router.push(ROUTES.PROJECT_DETAIL(projectId));
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="container mx-auto p-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          <FiPlus /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className={UI.SPINNER_CLASS}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.visibility === "public" ? (
                      <FiGlobe className="text-info" title="Public" />
                    ) : (
                      <FiLock className="text-gray-400" title="Private" />
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-400 mb-4">
                  Last updated:{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => openInIDE(project._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                  >
                    <FiEdit3 /> Open in IDE
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className={UI.BUTTON_DANGER}
                    title="Delete project"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-400 text-lg mb-4">No projects yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <FiPlus /> Create your first project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProjects(); // Refresh projects list after creation
        }}
      />
    </div>
  );
}
