'use client';
import { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackThemeProvider,
  SandpackStack,
} from '@codesandbox/sandpack-react';
import { nightOwl } from '@codesandbox/sandpack-themes';
import { ArrowLeftIcon, PlayIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import TreeFileExplorer from './TreeFileExplorer';

export default function SandpackEditor({ project, onBack }) {
  const sandpackFiles = useMemo(() => {
    const processedFiles = {};
    const files = project?.files || {};
    
    if (!files || Object.keys(files).length === 0) {
      return {};
    }

    Object.keys(files).forEach((filePath) => {
      const file = files[filePath];
      processedFiles[filePath] = {
        code: file.code || file.content || file,
      };
    });

    return processedFiles;
  }, [project?.files]);

  // File operations - these will be implemented later with backend integration
  const handleAddFile = (filePath, content = '') => {
    console.log('Add file:', filePath, content);
  };

  const handleDeleteFile = (filePath) => {
    console.log('Delete file:', filePath);
  };

  const handleAddFolder = (folderName) => {
    console.log('Add folder:', folderName);
  };

  // Don't render if no files
  if (!sandpackFiles || Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        Loading editor...
      </div>
    );
  }

  console.log('SandpackEditor rendering with files:', Object.keys(sandpackFiles));

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2 text-slate-300 hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Dashboard</span>
          </button>
          
          <div className="w-px h-6 bg-slate-600"></div>
          
          <div>
            <h1 className="text-lg font-semibold text-white">{project?.name || 'Untitled Project'}</h1>
            <p className="text-xs text-slate-400">{project?.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <PlayIcon className="h-4 w-4" />
            <span>Run</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <SandpackProvider
          files={sandpackFiles}
          customSetup={{
            entry: "/src/index.js",
            dependencies: {
              "react": "^18.0.0",
              "react-dom": "^18.0.0"
            }
          }}
          options={{
            autorun: true,
            recompileMode: 'immediate',
            recompileDelay: 300,
            activeFile: "/src/App.js"
          }}
        >
          <SandpackThemeProvider theme={nightOwl}>
            <div className="h-full w-full flex">
              <TreeFileExplorer 
                files={sandpackFiles}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                onAddFolder={handleAddFolder}
              />
              <div className="flex-1 flex">
                <SandpackCodeEditor
                  style={{
                    height: '100%',
                    flex: 1,
                  }}
                  wrapContent
                  showTabs
                  closableTabs
                  showInlineErrors
                  showLineNumbers
                />
                <SandpackPreview
                  style={{
                    height: '100%',
                    flex: 1,
                  }}
                  showNavigator
                  showRefreshButton
                  showOpenInCodeSandbox
                />
              </div>
            </div>
          </SandpackThemeProvider>
        </SandpackProvider>
      </div>
    </div>
  );
}