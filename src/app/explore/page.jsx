'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublicProjects } from '@/services/projectAPI';
import { toast } from 'react-toastify';
import { FiGlobe, FiEye } from 'react-icons/fi';
import { ROUTES, UI } from '@/constants';

export default function ExplorePage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  const fetchPublicProjects = async () => {
    try {
      setLoading(true);
      const data = await getPublicProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching public projects:', error);
      toast.error('Failed to load public projects');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (projectId) => {
    router.push(ROUTES.PROJECT_DETAIL(projectId));
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Explore Public Projects</h1>
          <p className="text-gray-400 mt-1">Discover projects created by the community</p>
        </div>
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
              onClick={() => handleProjectClick(project._id)}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  <div className="ml-2">
                    <FiGlobe className="text-info" title="Public Project" />
                  </div>
                </div>

                {/* Author */}
                <div className="text-sm text-gray-500 mb-4">
                  by {project.userId?.name || 'Anonymous'}
                </div>

                {/* Framework Badge */}
                {project.settings?.framework && (
                  <div className="mb-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {project.settings.framework}
                    </span>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project._id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                  >
                    <FiEye /> View Project
                  </button>
                  <span className="text-xs text-gray-500">
                    {Object.keys(project.files || {}).length} files
                  </span>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && !loading && (
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold mb-2">No public projects yet</h2>
              <p className="text-gray-400">Be the first to share your project with the community!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
