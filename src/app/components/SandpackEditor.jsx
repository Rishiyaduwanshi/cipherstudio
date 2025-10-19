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
import TreeFileExplorer from './TreeFileExplorer';

export default function SandpackEditor({ files, onAddFile, onDeleteFile, onAddFolder }) {
  const sandpackFiles = useMemo(() => {
    const processedFiles = {};
    
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
  }, [files]);

  // Don't render if no files
  if (!sandpackFiles || Object.keys(sandpackFiles).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Loading editor...
      </div>
    );
  }

  console.log('SandpackEditor rendering with files:', Object.keys(sandpackFiles));

  return (
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
            onAddFile={onAddFile}
            onDeleteFile={onDeleteFile}
            onAddFolder={onAddFolder}
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
  );
}