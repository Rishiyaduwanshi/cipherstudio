"use client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import TreeFileExplorer from "./TreeFileExplorer";
import CodeEditor from "./CodeEditor";
import LivePreview from "./LivePreview";
import { saveTempFiles } from "@/utils/storage";
import { getLanguage } from "@/utils/fileHelpers";
import {
  isFolder,
  joinPath,
  getChildFiles,
  renamePath,
} from "@/utils/pathHelpers";

export default function IDE({
  initialFiles = {},
  files: legacyFiles = null,
  onFilesChange,
  projectId = null,
  onBack = null,
  project = null,
  setProject = null,
}) {
  const startingFiles =
    initialFiles && Object.keys(initialFiles || {}).length
      ? initialFiles
      : legacyFiles || {};
  const [files, setFiles] = useState(startingFiles || {});
  const [activeFile, setActiveFile] = useState(
    Object.keys(startingFiles || {})[0] || null,
  );
  const [openTabs, setOpenTabs] = useState(() =>
    Object.keys(startingFiles || {}).slice(0, 3),
  );
  const [dirtyFiles, setDirtyFiles] = useState({});

  const [autoSave, setAutoSave] = useState(false);

  const editorRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ lineNumber: 1, column: 1 });
  const [collapsed, setCollapsed] = useState(false);
  const lastProjectIdRef = useRef(null);

  useEffect(() => {
    const keys = Object.keys(files || {});
    if (!activeFile && keys.length) setActiveFile(keys[0]);
    if (activeFile && !keys.includes(activeFile))
      setActiveFile(keys[0] || null);
  }, [files, activeFile]);

  const applyingInitialRef = useRef(false);
  useEffect(() => {
    if (!projectId) return;
    if (lastProjectIdRef.current === projectId) return;
    if (initialFiles && Object.keys(initialFiles).length) {
      applyingInitialRef.current = true;
      setFiles(initialFiles);
      setActiveFile(Object.keys(initialFiles)[0] || null);
      lastProjectIdRef.current = projectId;
      const t = setTimeout(() => {
        applyingInitialRef.current = false;
      }, 0);
      return () => clearTimeout(t);
    }
  }, [initialFiles, projectId]);

  useEffect(() => {
    if (typeof onFilesChange === "function") {
      if (applyingInitialRef.current) return;
      onFilesChange(files);
    }
  }, [files, onFilesChange]);

  const handleOpenFile = (filePath) => {
    setActiveFile(filePath);
    setOpenTabs((prev) => {
      if (!prev.includes(filePath)) return [...prev, filePath];
      return prev;
    });
  };

  const handleCodeChange = (newCode) => {
    const updatedFiles = {
      ...files,
      [activeFile]: { ...files[activeFile], code: newCode },
    };

    setFiles(updatedFiles);

    if (project && setProject) {
      setProject((prevProject) => ({
        ...prevProject,
        files: updatedFiles,
      }));
    }

    saveTempFiles(updatedFiles);

    setDirtyFiles((prev) => ({ ...prev, [activeFile]: true }));
  };

  const handleCursor = (pos) => {
    if (!pos) return;
    setCursorPos({ lineNumber: pos.lineNumber || 1, column: pos.column || 1 });
  };

  const handleAddFile = (filePath, content = "") => {
    setFiles((prev) => {
      const updated = { ...prev, [filePath]: { code: content } };
      saveTempFiles(updated);
      return updated;
    });
    setActiveFile(filePath);
    setOpenTabs((prev) =>
      prev.includes(filePath) ? prev : [...prev, filePath],
    );
    setDirtyFiles((prev) => ({ ...prev, [filePath]: false }));
    if (project && setProject) {
      setProject((prev) => ({
        ...(prev || {}),
        files: { ...(prev?.files || {}), [filePath]: { code: content } },
      }));
    }
  };

  const handleDeleteFile = (filePath) => {
    setFiles((prev) => {
      const copy = { ...prev };
      const isFolderPath = isFolder(filePath);

      if (isFolderPath) {
        getChildFiles(copy, filePath).forEach((k) => delete copy[k]);
      } else {
        delete copy[filePath];
      }

      saveTempFiles(copy);
      return copy;
    });

    setOpenTabs((prev) =>
      prev.filter((t) => !(t === filePath || t.startsWith(`${filePath}/`))),
    );

    setDirtyFiles((prev) => {
      const p = { ...prev };
      delete p[filePath];
      Object.keys(p).forEach((k) => {
        if (k.startsWith(`${filePath}/`)) delete p[k];
      });
      return p;
    });

    setFiles((prev) => {
      if (activeFile === filePath || activeFile?.startsWith(`${filePath}/`)) {
        const remaining = Object.keys(prev).filter(
          (k) => !(k === filePath || k.startsWith(`${filePath}/`)),
        );
        setActiveFile(remaining[0] || null);
      }
      return prev;
    });

    if (project && setProject) {
      setProject((prev) => {
        if (!prev) return prev;
        const copy = { ...(prev.files || {}) };
        const isFolderPath = isFolder(filePath);

        if (isFolderPath) {
          getChildFiles(copy, filePath).forEach((k) => delete copy[k]);
        } else {
          delete copy[filePath];
        }
        return { ...prev, files: copy };
      });
    }
  };

  const handleAddFolder = (folderName, parentPath = "/") => {
    const indexFile = joinPath(
      parentPath === "/" ? "" : parentPath,
      folderName,
      "index.js",
    );
    handleAddFile(indexFile, "// Folder created\n");
  };

  const handleRenameFile = (oldPath, newName) => {
    if (!oldPath || !newName) return;
    const isFolderPath = isFolder(oldPath);
    const newBase = renamePath(oldPath, newName);

    // check collisions
    if (isFolderPath) {
      const collides = Object.keys(files || {}).some(
        (k) => k === newBase || k.startsWith(`${newBase}/`),
      );
      if (collides) return;

      setFiles((prev) => {
        const copy = { ...prev };
        const prefix = oldPath.endsWith("/") ? oldPath : `${oldPath}/`;
        Object.keys(prev).forEach((k) => {
          if (k === oldPath || k.startsWith(prefix)) {
            const rest = k.slice(prefix.length);
            const newKey = joinPath(newBase, rest);
            copy[newKey] = copy[k];
            delete copy[k];
          }
        });
        saveTempFiles(copy);
        return copy;
      });

      setOpenTabs((prev) =>
        prev.map((t) =>
          t === oldPath || t.startsWith(`${oldPath}/`)
            ? t.replace(oldPath, newBase)
            : t,
        ),
      );
      setActiveFile((prev) =>
        prev && (prev === oldPath || prev.startsWith(`${oldPath}/`))
          ? prev.replace(oldPath, newBase)
          : prev,
      );

      if (project && setProject) {
        setProject((prev) => {
          if (!prev) return prev;
          const copy = { ...(prev.files || {}) };
          const prefix = oldPath.endsWith("/") ? oldPath : `${oldPath}/`;
          Object.keys(prev.files || {}).forEach((k) => {
            if (k === oldPath || k.startsWith(prefix)) {
              const rest = k.slice(prefix.length);
              const newKey = joinPath(newBase, rest);
              copy[newKey] = copy[k];
              delete copy[k];
            }
          });
          return { ...prev, files: copy };
        });
      }
    } else {
      if (newBase === oldPath) return;
      if (files[newBase]) return;

      setFiles((prev) => {
        const copy = { ...prev };
        copy[newBase] = copy[oldPath];
        delete copy[oldPath];
        saveTempFiles(copy);
        return copy;
      });

      setOpenTabs((prev) => prev.map((t) => (t === oldPath ? newBase : t)));
      setActiveFile((prev) => (prev === oldPath ? newBase : prev));

      if (project && setProject) {
        setProject((prev) => {
          if (!prev) return prev;
          const copy = { ...(prev.files || {}) };
          copy[newBase] = copy[oldPath];
          delete copy[oldPath];
          return { ...prev, files: copy };
        });
      }
    }
  };

  const handleSaveCurrent = async () => {
    if (!activeFile) return;
    try {
      const val = await editorRef.current?.getValue();
      setFiles((prev) => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], code: val },
      }));
      setDirtyFiles((prev) => ({ ...prev, [activeFile]: false }));

      if (project && setProject) {
        const updated = {
          ...(project || {}),
          files: { ...(project.files || {}), [activeFile]: { code: val } },
        };
        setProject(updated);
      }
    } catch (e) {
      console.error("Save failed", e);
      toast.error("Save failed");
    }
  };

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveCurrent();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeFile, files]);

  useEffect(() => {
    if (!autoSave) return;
    const t = setInterval(() => {
      const dirty = Object.keys(dirtyFiles || {}).filter((k) => dirtyFiles[k]);
      if (dirty.length === 0) return;

      if (project && setProject) {
        setProject((prev) => ({
          ...(prev || {}),
          files: { ...(prev?.files || {}), ...files },
        }));
      } else {
        saveTempFiles(files);
      }
      setDirtyFiles({});
    }, 5000);
    return () => clearInterval(t);
  }, [autoSave, dirtyFiles, files, project, setProject]);

  return (
    <div className="relative flex h-full w-full min-h-0">
      {/* Optional back button overlay (used by the landing page when opening the local editor) */}
      {onBack && (
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={onBack}
            className="px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-700"
          >
            ← Back
          </button>
        </div>
      )}
      {/* Explorer (narrower) */}
      <div
        className={`${
          collapsed ? "w-16" : "w-72"
        } border-r border-gray-700 min-h-0 transition-all duration-150`}
      >
        <TreeFileExplorer
          files={files}
          onAddFile={handleAddFile}
          onDeleteFile={handleDeleteFile}
          onAddFolder={handleAddFolder}
          onRenameFile={handleRenameFile}
          onOpenFile={handleOpenFile}
          activeFile={activeFile}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((s) => !s)}
        />
      </div>

      {/* Editor (main) with toolbar and tabs */}
      <div className="flex-1 border-r border-gray-700 min-h-0 flex flex-col">
        {/* Editor area */}
        <div className="flex-1 min-h-0 h-full">
          {activeFile && (
            <CodeEditor
              ref={editorRef}
              code={files[activeFile]?.code || ""}
              onChange={handleCodeChange}
              onCursor={handleCursor}
              language={getLanguage(activeFile)}
            />
          )}
        </div>

        {/* Status bar */}
        <div className="ide-statusbar">
          <div>
            {activeFile ? activeFile.split("/").pop() : "No file"} •{" "}
            {getLanguage(activeFile)}
          </div>
          <div>
            Ln {cursorPos.lineNumber}, Col {cursorPos.column}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-1/3 min-h-0">
        <LivePreview files={files} />
      </div>
    </div>
  );
}
