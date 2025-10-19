'use client';
import { useSandpack } from '@codesandbox/sandpack-react';
import { useState } from 'react';
import { useFileTree } from '../hooks/useFileTree';

export default function TreeFileExplorer({ files, onAddFile, onDeleteFile, onAddFolder }) {
  const { sandpack } = useSandpack();
  const { tree, toggleFolder, getChildren } = useFileTree(files);
  const [showNewFileInput, setShowNewFileInput] = useState(null); // folder path where to add file
  const [showNewFolderInput, setShowNewFolderInput] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const handleFileClick = (filePath) => {
    sandpack.openFile(filePath);
    sandpack.setActiveFile(filePath);
  };

  const handleFolderToggle = (folderPath) => {
    toggleFolder(folderPath);
  };

  const handleRightClick = (e, filePath, isFolder = false) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      filePath,
      isFolder
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleAddNewFile = (folderPath = '/') => {
    setShowNewFileInput(folderPath);
    setContextMenu(null);
  };

  const handleAddNewFolder = (folderPath = '/') => {
    setShowNewFolderInput(folderPath);
    setContextMenu(null);
  };

  const handleDeleteFile = (filePath) => {
    if (onDeleteFile) {
      onDeleteFile(filePath);
    }
    setContextMenu(null);
  };

  const handleCreateFile = (e, folderPath) => {
    if (e.key === 'Enter' && newFileName.trim()) {
      const cleanFolderPath = folderPath === '/' ? '' : folderPath;
      const filePath = `${cleanFolderPath}/${newFileName}`.replace(/\/+/g, '/');
      
      if (onAddFile) {
        onAddFile(filePath, '// New file\n');
      }
      setNewFileName('');
      setShowNewFileInput(null);
    } else if (e.key === 'Escape') {
      setNewFileName('');
      setShowNewFileInput(null);
    }
  };

  const handleCreateFolder = (e, parentPath) => {
    if (e.key === 'Enter' && newFolderName.trim()) {
      const cleanParentPath = parentPath === '/' ? '' : parentPath;
      const folderPath = `${cleanParentPath}/${newFolderName}`.replace(/\/+/g, '/');
      
      if (onAddFolder) {
        onAddFolder(newFolderName, parentPath);
      }
      setNewFolderName('');
      setShowNewFolderInput(null);
    } else if (e.key === 'Escape') {
      setNewFolderName('');
      setShowNewFolderInput(null);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return '📄';
      case 'jsx': return '⚛️';
      case 'ts': case 'tsx': return '🟦';
      case 'css': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return '🖼️';
      default: return '📄';
    }
  };

  const renderTreeNode = (node, depth = 0) => {
    if (!node) return null;

    const isActive = sandpack.activeFile === node.path;
    const paddingLeft = depth * 16;

    if (node.type === 'file') {
      return (
        <div
          key={node.path}
          className={`
            flex items-center py-1 px-2 text-sm cursor-pointer select-none group
            ${isActive 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
            }
          `}
          style={{ paddingLeft: paddingLeft + 24 }}
        >
          <div 
            className="flex-1 flex items-center"
            onClick={() => handleFileClick(node.path)}
            onContextMenu={(e) => handleRightClick(e, node.path, false)}
          >
            <span className="mr-2">{getFileIcon(node.name)}</span>
            <span className="truncate">{node.name}</span>
          </div>
          {node.path !== '/src/index.js' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(node.path);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 rounded transition-opacity"
              title={`Delete ${node.name}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
              </svg>
            </button>
          )}
        </div>
      );
    }

    // Folder rendering
    const children = getChildren(node);
    const hasChildren = children.length > 0;

    return (
      <div key={node.path || node.name}>
        <div
          onClick={() => node.path !== '/' && handleFolderToggle(node.path)}
          onContextMenu={(e) => handleRightClick(e, node.path, true)}
          className={`
            flex items-center py-1 px-2 text-sm cursor-pointer select-none
            ${node.path !== '/' ? 'hover:bg-gray-700' : ''}
            text-gray-300
          `}
          style={{ paddingLeft }}
        >
          {node.path !== '/' && (
            <>
              <span className="mr-1 text-xs">
                {node.isExpanded ? '📂' : '📁'}
              </span>
              <span className="mr-2">
                {hasChildren && (node.isExpanded ? '▼' : '▶')}
              </span>
              <span className="truncate font-medium">{node.name}</span>
            </>
          )}
        </div>

        {/* New File Input */}
        {showNewFileInput === node.path && (
          <div 
            className="px-2"
            style={{ paddingLeft: paddingLeft + 16 }}
          >
            <div className="flex items-center">
              <span className="mr-2">📄</span>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => handleCreateFile(e, node.path)}
                onBlur={() => setShowNewFileInput(null)}
                className="bg-gray-700 text-white text-sm px-2 py-1 rounded flex-1"
                placeholder="filename.js"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* New Folder Input */}
        {showNewFolderInput === node.path && (
          <div 
            className="px-2"
            style={{ paddingLeft: paddingLeft + 16 }}
          >
            <div className="flex items-center">
              <span className="mr-2">📁</span>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => handleCreateFolder(e, node.path)}
                onBlur={() => setShowNewFolderInput(null)}
                className="bg-gray-700 text-white text-sm px-2 py-1 rounded flex-1"
                placeholder="folder-name"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Render children if expanded */}
        {(node.path === '/' || node.isExpanded) && hasChildren && (
          <div>
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!tree) {
    return (
      <div className="w-64 h-full bg-gray-800 border-r border-gray-700 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Explorer</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAddNewFile('/')}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="New File"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                <path d="M12,14 L12,11 L14,11 L14,14 L17,14 L17,16 L14,16 L14,19 L12,19 L12,16 L9,16 L9,14 Z"/>
              </svg>
            </button>
            <button
              onClick={() => handleAddNewFolder('/')}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="New Folder"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z"/>
                <path d="M12,10 L12,8 L14,8 L14,10 L16,10 L16,12 L14,12 L14,14 L12,14 L12,12 L10,12 L10,10 Z"/>
              </svg>
            </button>
            {sandpack.activeFile && sandpack.activeFile !== '/src/index.js' && (
              <button
                onClick={() => handleDeleteFile(sandpack.activeFile)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
                title={`Delete ${sandpack.activeFile.split('/').pop()}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto">
          {renderTreeNode(tree)}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-700 border border-gray-600 rounded shadow-lg z-50 py-1 min-w-32"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.isFolder && (
            <>
              <button
                onClick={() => handleAddNewFile(contextMenu.filePath)}
                className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
              >
                📄 New File
              </button>
              <button
                onClick={() => handleAddNewFolder(contextMenu.filePath)}
                className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
              >
                📁 New Folder
              </button>
              <hr className="border-gray-600 my-1" />
            </>
          )}
          <button
            onClick={() => handleDeleteFile(contextMenu.filePath)}
            className="block w-full text-left px-3 py-1 text-sm text-red-400 hover:bg-gray-600"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </>
  );
}