'use client';
import { useState, useEffect, useRef } from 'react';
import projectAPI from '@/services/projectAPI';
import { toast } from 'react-toastify';
import TreeFileExplorer from './TreeFileExplorer';
import CodeEditor from './CodeEditor';
import LivePreview from './LivePreview';

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
    Object.keys(startingFiles || {})[0] || null
  );
  const [openTabs, setOpenTabs] = useState(() =>
    Object.keys(startingFiles || {}).slice(0, 3)
  );
  const [dirtyFiles, setDirtyFiles] = useState({});

  const [autoSave, setAutoSave] = useState(false);

  const editorRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ lineNumber: 1, column: 1 });
  const [collapsed, setCollapsed] = useState(false);
  const lastProjectIdRef = useRef(null);

  // keep active file valid if files change externally
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
    // new project loaded, adopt files
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
    if (typeof onFilesChange === 'function') {
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
    setFiles((prev) => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], code: newCode },
    }));
    setDirtyFiles((prev) => ({ ...prev, [activeFile]: true }));
  };

  const handleCursor = (pos) => {
    if (!pos) return;
    setCursorPos({ lineNumber: pos.lineNumber || 1, column: pos.column || 1 });
  };



  // File operations: add, delete, create folder, rename
  const handleAddFile = (filePath, content = '') => {
    setFiles((prev) => {
      const updated = { ...prev, [filePath]: { code: content } };
      return updated;
    });
    setActiveFile(filePath);
    setOpenTabs((prev) =>
      prev.includes(filePath) ? prev : [...prev, filePath]
    );
    setDirtyFiles((prev) => ({ ...prev, [filePath]: false }));
    // update project context if present
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
      // if path corresponds to a folder (no extension) remove all children
      const isFolder = !/\.[\w\d]+$/.test(filePath);
      if (isFolder) {
        // delete all keys that start with folder path (ensure trailing slash)
        const prefix = filePath.endsWith('/') ? filePath : `${filePath}/`;
        Object.keys(copy).forEach((k) => {
          if (k === filePath || k.startsWith(prefix)) delete copy[k];
        });
      } else {
        delete copy[filePath];
      }
      return copy;
    });
    // cleanup tabs & dirty flags
    setOpenTabs((prev) =>
      prev.filter((t) => !(t === filePath || t.startsWith(`${filePath}/`)))
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
          (k) => !(k === filePath || k.startsWith(`${filePath}/`))
        );
        setActiveFile(remaining[0] || null);
      }
      return prev;
    });
    // Update project context
    if (project && setProject) {
      setProject((prev) => {
        if (!prev) return prev;
        const copy = { ...(prev.files || {}) };
        const isFolder = !/\.[\w\d]+$/.test(filePath);
        if (isFolder) {
          const prefix = filePath.endsWith('/') ? filePath : `${filePath}/`;
          Object.keys(copy).forEach((k) => {
            if (k === filePath || k.startsWith(prefix)) delete copy[k];
          });
        } else {
          delete copy[filePath];
        }
        return { ...prev, files: copy };
      });
    }
  };

  const handleAddFolder = (folderName, parentPath = '/') => {
    const cleanParent = parentPath === '/' ? '' : parentPath;
    const folderPath = `${cleanParent}/${folderName}`.replace(/\/+/g, '/');
    const indexFile = `${folderPath}/index.js`.replace(/\/+/g, '/');
    handleAddFile(indexFile, '// Folder created\n');
  };

  const handleRenameFile = (oldPath, newName) => {
    if (!oldPath || !newName) return;
    const isFolder = !/\.[\w\d]+$/.test(oldPath);
    // compute parent path
    const lastSlash = oldPath.lastIndexOf('/');
    const parent = lastSlash === 0 ? '/' : oldPath.slice(0, lastSlash);
    const newBase = `${parent === '/' ? '' : parent}/${newName}`.replace(
      /\/+/g,
      '/'
    );

    // check collisions
    if (isFolder) {
      // any existing file with newBase prefix?
      const collides = Object.keys(files || {}).some(
        (k) => k === newBase || k.startsWith(`${newBase}/`)
      );
      if (collides) {
        toast.error('Rename failed: target folder already exists');
        return;
      }
      // perform rename for all children
      setFiles((prev) => {
        const copy = { ...prev };
        const prefix = oldPath.endsWith('/') ? oldPath : `${oldPath}/`;
        Object.keys(prev).forEach((k) => {
          if (k === oldPath || k.startsWith(prefix)) {
            const rest = k.slice(prefix.length);
            const newKey = `${newBase}/${rest}`.replace(/\/+/g, '/');
            copy[newKey] = copy[k];
            delete copy[k];
          }
        });
        return copy;
      });
      // update openTabs and activeFile
      setOpenTabs((prev) =>
        prev.map((t) =>
          t === oldPath || t.startsWith(`${oldPath}/`)
            ? t.replace(oldPath, newBase)
            : t
        )
      );
      setActiveFile((prev) =>
        prev && (prev === oldPath || prev.startsWith(`${oldPath}/`))
          ? prev.replace(oldPath, newBase)
          : prev
      );
      // update project
      if (project && setProject) {
        setProject((prev) => {
          if (!prev) return prev;
          const copy = { ...(prev.files || {}) };
          const prefix = oldPath.endsWith('/') ? oldPath : `${oldPath}/`;
          Object.keys(prev.files || {}).forEach((k) => {
            if (k === oldPath || k.startsWith(prefix)) {
              const rest = k.slice(prefix.length);
              const newKey = `${newBase}/${rest}`.replace(/\/+/g, '/');
              copy[newKey] = copy[k];
              delete copy[k];
            }
          });
          return { ...prev, files: copy };
        });
      }
      toast.success('Folder renamed');
    } else {
      // file rename
      const newPath = `${parent === '/' ? '' : parent}/${newName}`.replace(
        /\/+/g,
        '/'
      );
      if (newPath === oldPath) return;
      if (files[newPath]) {
        toast.error('Rename failed: target file already exists');
        return;
      }
      setFiles((prev) => {
        const copy = { ...prev };
        copy[newPath] = copy[oldPath];
        delete copy[oldPath];
        return copy;
      });
      setOpenTabs((prev) => prev.map((t) => (t === oldPath ? newPath : t)));
      setActiveFile((prev) => (prev === oldPath ? newPath : prev));
      if (project && setProject) {
        setProject((prev) => {
          if (!prev) return prev;
          const copy = { ...(prev.files || {}) };
          copy[newPath] = copy[oldPath];
          delete copy[oldPath];
          return { ...prev, files: copy };
        });
      }
      toast.success('File renamed');
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
      // mark as saved
      setDirtyFiles((prev) => ({ ...prev, [activeFile]: false }));
      toast.success('Saved (local)');
      // If project context exists, update parent's project files and optionally autosave to server
      if (project && setProject) {
        const updated = {
          ...(project || {}),
          files: { ...(project.files || {}), [activeFile]: { code: val } },
        };
        setProject(updated);
      }
    } catch (e) {
      console.error('Save failed', e);
      toast.error('Save failed');
    }
  };

  const handleSaveToServer = async () => {
    if (!project && !projectId) {
      toast.error('Cannot save to server: no project context');
      return;
    }
    try {
      const payload = {
        _id: project?._id || project?.id || projectId,
        name: project?.name || `Project ${projectId || 'local'}`,
        description: project?.description || '',
        files,
        settings: project?.settings || {},
      };
      const result = await projectAPI.saveProject(payload);
      toast.success('Saved to server');
      // Update project id/local data
      if (setProject)
        setProject((prev) => ({
          ...(prev || {}),
          _id: result._id || result.id,
          ...result,
        }));
    } catch (err) {
      console.error('Save to server failed', err);
      toast.error(err?.message || 'Save to server failed');
    }
  };

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveCurrent();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
        localStorage.setItem('cipherstudio-temp', JSON.stringify({ files }));
      }
      // clear dirty flags after local save
      setDirtyFiles({});
      toast.info('Auto-saved');
    }, 5000);
    return () => clearInterval(t);
  }, [autoSave, dirtyFiles, files, project, setProject]);

  // Determine language for editor based on file extension
  const getLanguage = (filePath) => {
    const ext = filePath?.split('.').pop();
    switch (ext) {
      case 'js':
        return 'javascript';
      case 'jsx':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'javascript';
    }
  };

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
          collapsed ? 'w-16' : 'w-72'
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
        <div className="flex-1 min-h-0">
          {activeFile && (
            <CodeEditor
              ref={editorRef}
              code={files[activeFile]?.code || ''}
              onChange={handleCodeChange}
              onCursor={handleCursor}
              language={getLanguage(activeFile)}
            />
          )}
        </div>

        {/* Status bar */}
        <div className="ide-statusbar">
          <div>
            {activeFile ? activeFile.split('/').pop() : 'No file'} •{' '}
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
