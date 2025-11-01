"use client";
import { useState } from "react";
import { useFileTree } from "../hooks/useFileTree";
import { getFileIcon } from "@/utils/fileHelpers";
import { isFolder } from "@/utils/pathHelpers";

export default function TreeFileExplorer({
  files,
  onAddFile,
  onDeleteFile,
  onAddFolder,
  onOpenFile,
  activeFile,
  collapsed = false,
  onToggleCollapse,
  onRenameFile,
}) {
  const { tree, toggleFolder, getChildren } = useFileTree(files);
  const [showNewFileInput, setShowNewFileInput] = useState(null); // folder path where to add file
  const [showNewFolderInput, setShowNewFolderInput] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showRenameInput, setShowRenameInput] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  const handleFileClick = (filePath) => {
    if (typeof onOpenFile === "function") onOpenFile(filePath);
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
      isFolder,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Show the new file input for a folder (used by header buttons and context menu)
  const handleAddNewFile = (folderPath = "/") => {
    setShowNewFileInput(folderPath || "/");
    setNewFileName("");
    closeContextMenu();
  };

  // Show the new folder input for a parent folder
  const handleAddNewFolder = (parentPath = "/") => {
    setShowNewFolderInput(parentPath || "/");
    setNewFolderName("");
    closeContextMenu();
  };

  const handleDeleteFile = (filePath) => {
    if (!filePath) return;
    const isFolderPath = isFolder(filePath);
    const name = (filePath || "").split("/").pop() || filePath;
    const confirmMsg = isFolderPath
      ? `Delete folder "${filePath}" and all its contents? This cannot be undone.`
      : `Delete file "${name}"? This cannot be undone.`;
    if (!window.confirm(confirmMsg)) {
      closeContextMenu();
      return;
    }
    if (onDeleteFile) {
      onDeleteFile(filePath);
    }
    closeContextMenu();
  };

  const handleCreateFile = (e, folderPath) => {
    if (e.key === "Enter" && newFileName.trim()) {
      const cleanFolderPath = folderPath === "/" ? "" : folderPath;
      const filePath = `${cleanFolderPath}/${newFileName}`.replace(/\/+/g, "/");

      if (onAddFile) {
        onAddFile(filePath, "// New file\n");
      }
      setNewFileName("");
      setShowNewFileInput(null);
    } else if (e.key === "Escape") {
      setNewFileName("");
      setShowNewFileInput(null);
    }
  };

  const handleCreateFolder = (e, parentPath) => {
    if (e.key === "Enter" && newFolderName.trim()) {
      const cleanParentPath = parentPath === "/" ? "" : parentPath;
      const folderPath = `${cleanParentPath}/${newFolderName}`.replace(
        /\/+/g,
        "/",
      );

      if (onAddFolder) {
        onAddFolder(newFolderName, parentPath);
      }
      setNewFolderName("");
      setShowNewFolderInput(null);
    } else if (e.key === "Escape") {
      setNewFolderName("");
      setShowNewFolderInput(null);
    }
  };

  const handleRenameKey = (e, oldPath) => {
    if (e.key === "Enter" && renameValue.trim()) {
      if (typeof onRenameFile === "function") {
        onRenameFile(oldPath, renameValue.trim());
      }
      setRenameValue("");
      setShowRenameInput(null);
    } else if (e.key === "Escape") {
      setRenameValue("");
      setShowRenameInput(null);
    }
  };

  const renderTreeNode = (node, depth = 0) => {
    if (!node) return null;

    const isActive = activeFile === node.path;
    const paddingLeft = depth * 16;

    if (node.type === "file") {
      return (
        <div key={node.path} className="w-full">
          <div
            className={`
              flex items-center py-1 px-2 text-sm cursor-pointer select-none group
              ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-300 hover:bg-gray-700"
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
              {!collapsed && <span className="truncate">{node.name}</span>}
            </div>
            {node.path !== "/src/index.js" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(node.path);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:opacity-80 rounded transition-opacity"
                title={`Delete ${node.name}`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
                </svg>
              </button>
            )}
          </div>

          {showRenameInput === node.path && (
            <div className="px-2" style={{ paddingLeft: paddingLeft + 16 }}>
              <div className="flex items-center">
                <span className="mr-2">Rename:</span>
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => handleRenameKey(e, node.path)}
                  onBlur={() => setShowRenameInput(null)}
                  className="text-sm px-2 py-1 rounded flex-1"
                  placeholder="new-name.ext"
                  autoFocus
                  style={{
                    background: "var(--input)",
                    color: "var(--foreground)",
                  }}
                />
              </div>
            </div>
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
          onClick={() => node.path !== "/" && handleFolderToggle(node.path)}
          onContextMenu={(e) => handleRightClick(e, node.path, true)}
          className={`
            flex items-center py-1 px-2 text-sm cursor-pointer select-none
            ${node.path !== "/" ? "hover:bg-gray-700" : ""}
            text-gray-300
          `}
          style={{ paddingLeft }}
        >
          {node.path !== "/" && (
            <>
              <span className="mr-1 text-xs">
                {node.isExpanded ? "📂" : "📁"}
              </span>
              <span className="mr-2">
                {hasChildren && (node.isExpanded ? "▼" : "▶")}
              </span>
              {!collapsed && (
                <span className="truncate font-medium">{node.name}</span>
              )}
            </>
          )}
        </div>

        {/* Folder Rename Input */}
        {showRenameInput === node.path && (
          <div className="px-2" style={{ paddingLeft: paddingLeft + 16 }}>
            <div className="flex items-center">
              <span className="mr-2">Rename:</span>
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => handleRenameKey(e, node.path)}
                onBlur={() => setShowRenameInput(null)}
                className="text-sm px-2 py-1 rounded flex-1"
                placeholder={node.name}
                autoFocus
                style={{
                  background: "var(--input)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>
        )}

        {/* New Folder Input */}
        {showNewFolderInput === node.path && (
          <div className="px-2" style={{ paddingLeft: paddingLeft + 16 }}>
            <div className="flex items-center">
              <span className="mr-2">📁</span>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => handleCreateFolder(e, node.path)}
                onBlur={() => setShowNewFolderInput(null)}
                className="text-sm px-2 py-1 rounded flex-1"
                placeholder="folder-name"
                autoFocus
                style={{
                  background: "var(--input)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>
        )}

        {/* New File Input */}
        {showNewFileInput === node.path && (
          <div className="px-2" style={{ paddingLeft: paddingLeft + 16 }}>
            <div className="flex items-center">
              <span className="mr-2">📄</span>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => handleCreateFile(e, node.path)}
                onBlur={() => setShowNewFileInput(null)}
                className="text-sm px-2 py-1 rounded flex-1"
                placeholder="filename.js"
                autoFocus
                style={{
                  background: "var(--input)",
                  color: "var(--foreground)",
                }}
              />
            </div>
          </div>
        )}

        {/* Render children if expanded */}
        {(node.path === "/" || node.isExpanded) && hasChildren && (
          <div>{children.map((child) => renderTreeNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  if (!tree) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
      >
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="h-full w-full flex flex-col"
        style={{ background: "var(--card)", color: "var(--card-foreground)" }}
      >
        {/* Header */}
        <div
          className="px-3 py-2 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCollapse && onToggleCollapse()}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title={collapsed ? "Expand explorer" : "Collapse explorer"}
            >
              {collapsed ? "➡" : "⬅"}
            </button>
            {!collapsed && (
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Explorer
              </h3>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAddNewFile("/")}
              className="btn-icon"
              title="New File"
              aria-label="New file"
            >
              📄
            </button>
            <button
              onClick={() => handleAddNewFolder("/")}
              className="btn-icon"
              title="New Folder"
              aria-label="New folder"
            >
              📁
            </button>
            {activeFile && activeFile !== "/src/index.js" && (
              <button
                onClick={() => handleDeleteFile(activeFile)}
                className="btn-icon"
                title={`Delete ${activeFile.split("/").pop()}`}
                aria-label="Delete file"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Tree */}
        <div className="flex-1 overflow-y-auto">{renderTreeNode(tree)}</div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed rounded shadow-lg z-50 py-1 min-w-32"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            background: "var(--popover)",
            border: "1px solid var(--border)",
            color: "var(--popover-foreground)",
          }}
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
            onClick={() => {
              setShowRenameInput(contextMenu.filePath);
              setRenameValue(
                (contextMenu.filePath || "").split("/").pop() || "",
              );
              closeContextMenu();
            }}
            className="block w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-600"
          >
            Rename
          </button>
          <button
            onClick={() => handleDeleteFile(contextMenu.filePath)}
            className="block w-full text-left px-3 py-1 text-sm text-destructive hover:bg-gray-600"
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
      )}
    </>
  );
}
