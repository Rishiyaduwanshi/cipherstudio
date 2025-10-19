'use client';
import { useState, useEffect } from 'react';
import { initialFiles } from '@/app/data/initialProject-react';
import ProjectManager from './components/ProjectManager';
import ThemeSwitcher from './components/ThemeSwitcher';
import SandpackEditor from './components/SandpackEditor';

export default function Home() {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // File operations
  const handleAddFile = (filePath, content = '') => {
    const updatedProject = {
      ...project,
      files: {
        ...project.files,
        [filePath]: { code: content }
      }
    };
    setProject(updatedProject);
    localStorage.setItem('cipherstudio-project', JSON.stringify(updatedProject));
  };

  const handleDeleteFile = (filePath) => {
    const updatedFiles = { ...project.files };
    delete updatedFiles[filePath];
    const updatedProject = {
      ...project,
      files: updatedFiles
    };
    setProject(updatedProject);
    localStorage.setItem('cipherstudio-project', JSON.stringify(updatedProject));
  };

  const handleAddFolder = (folderName) => {
    // Create a placeholder file in the folder
    const filePath = `/${folderName}/index.js`;
    handleAddFile(filePath, '// Folder created\n');
  };

  useEffect(() => {
    if (!isMounted) return;
    
    const loadProject = () => {
      try {
        const savedProject = localStorage.getItem('cipherstudio-project');
        
        if (savedProject && savedProject !== 'undefined') {
          const parsed = JSON.parse(savedProject);
          if (parsed && parsed.files && Object.keys(parsed.files).length > 0) {
            console.log('Loading saved project:', parsed);
            setProject(parsed);
            setIsLoading(false);
            return;
          }
        }

        // Use initialFiles if no valid saved project
        console.log('Loading initial project with files:', Object.keys(initialFiles));
        const initialProject = {
          name: 'CipherStudio Project',
          files: initialFiles,
        };

        setProject(initialProject);
        localStorage.setItem('cipherstudio-project', JSON.stringify(initialProject));
        
      } catch (error) {
        console.error('localStorage error:', error);
        // Use initialFiles on error
        const initialProject = {
          name: 'CipherStudio Project',
          files: initialFiles,
        };
        setProject(initialProject);
        localStorage.removeItem('cipherstudio-project');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [isMounted]);

  // Show loading until component is mounted and project is loaded
  if (!isMounted || isLoading || !project) {
    return (
      <div className="h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading CipherStudio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="h-12 bg-gray-800 flex items-center px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">CipherStudio</h1>
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-gray-400">Project: {project.name}</span>
          <ThemeSwitcher />
          <ProjectManager project={project} setProject={setProject} />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 3rem)' }}>
        <SandpackEditor 
          files={project.files}
          onAddFile={handleAddFile}
          onDeleteFile={handleDeleteFile}
          onAddFolder={handleAddFolder}
        />
      </div>
    </div>
  );
}
