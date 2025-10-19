'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';
import useProjectStore from '@/stores/projectStore';
import {
  HomeIcon,
  FolderIcon,
  CodeBracketIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const Dashboard = ({ onOpenIDE }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { projects, loading, fetchProjects, createProject, setCurrentProject } = useProjectStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createNewProject = async () => {
    const projectData = {
      name: 'New Project',
      description: 'A new CipherStudio project',
      files: {}
    };
    
    const result = await createProject(projectData);
    if (result.success) {
      onOpenIDE(result.project);
    }
  };

  const openProject = (project) => {
    setCurrentProject(project);
    onOpenIDE(project);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLanguageColor = (language) => {
    const colors = {
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-blue-500',
      'CSS': 'bg-pink-500',
      'HTML': 'bg-orange-500',
      'Java': 'bg-red-500',
      'C++': 'bg-purple-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  const sidebarItems = [
    { icon: HomeIcon, label: 'Overview', id: 'overview', active: true },
    { icon: FolderIcon, label: 'Projects', id: 'projects' },
    { icon: CodeBracketIcon, label: 'IDE', id: 'ide' },
    { icon: UserIcon, label: 'Profile', id: 'profile' },
    { icon: CogIcon, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="h-screen flex bg-slate-900">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CS</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  CipherStudio
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-slate-700 rounded-md transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    item.active 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{user?.name || 'User'}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="flex-1 p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-yellow-400 mx-auto" />
              ) : (
                <MoonIcon className="h-5 w-5 text-slate-700 mx-auto" />
              )}
            </button>
            
            <button
              onClick={logout}
              className="flex-1 p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-400 hover:text-red-400 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'Developer'}!</h1>
              <p className="text-slate-400 text-sm">Ready to build something amazing today?</p>
            </div>
            
            <button
              onClick={createNewProject}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-600/20 rounded-lg">
                  <FolderIcon className="h-8 w-8 text-indigo-400" />
                </div>
                <div className="ml-4">
                  <p className="text-slate-400 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold text-white">{projects.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <CodeBracketIcon className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-slate-400 text-sm">Lines of Code</p>
                  <p className="text-3xl font-bold text-white">1,247</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <HomeIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-slate-400 text-sm">Hours Coded</p>
                  <p className="text-3xl font-bold text-white">42</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                  View All
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProject(project)}
                      className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${getLanguageColor(project.language)}`}></div>
                        <div>
                          <h3 className="text-white font-medium group-hover:text-indigo-300">
                            {project.name}
                          </h3>
                          <p className="text-slate-400 text-sm">{project.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">
                          Updated {formatDate(project.updatedAt || project.createdAt)}
                        </p>
                        <p className="text-slate-500 text-xs">
                          Created {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No projects yet</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Create your first project to get started
                  </p>
                  <button
                    onClick={createNewProject}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Create Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;