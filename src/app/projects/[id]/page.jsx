'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import IDE from '@/components/IDE';
import ProjectManager from '@/components/ProjectManager';
import useProjectStore from '@/stores/projectStore';
import { initialFiles as demoInitialFiles } from '@/data/initialProject-react';

export default function EditorPage({ params }) {
  const router = useRouter();
  const { fetchProjectById } = useProjectStore();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [unauthenticated, setUnauthenticated] = useState(false);

  // `params` may be a Promise-like proxy in newer Next.js versions.
  // Unwrap with `React.use()` when available to avoid sync-access warnings
  // and to support future Next.js behavior. Fall back to the provided
  // `params` object when `React.use` is not available.
  const resolvedParams = typeof React.use === 'function' ? React.use(params) : params;
  const id = resolvedParams?.id;

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const proj = await fetchProjectById(id);

        // Normalize 'files' shape from the server so the UI always receives
        // an object with filePath -> { code } entries. Backend may return
        // arrays, raw strings, or objects with different keys depending on
        // server version; normalize those here.
        const normalizeFiles = (files) => {
          if (!files) return {};
          // If backend returns an array of { path, code/content }
          if (Array.isArray(files)) {
            return files.reduce((acc, item) => {
              const path = item?.path || item?.filePath || item?.name || item?.filename || '/untitled';
              const code = typeof item === 'string' ? item : (item?.code || item?.content || item?.value || '');
              acc[path] = { code };
              return acc;
            }, {});
          }

          // If backend returns an object, values may be strings or nested objects.
          if (typeof files === 'object') {
            const out = {};
            Object.entries(files).forEach(([k, v]) => {
              if (typeof v === 'string') out[k] = { code: v };
              else if (v && typeof v === 'object') {
                if ('code' in v) out[k] = v;
                else if ('content' in v) out[k] = { code: v.content };
                else out[k] = { code: JSON.stringify(v) };
              } else out[k] = { code: '' };
            });
            return out;
          }
          return {};
        };

        const normalized = { ...(proj || {}) };
        normalized.files = normalizeFiles(proj?.files);
        console.info('Loaded project; files normalized ->', Object.keys(normalized.files || {}).length, 'files');
        setProject(normalized);
      } catch (err) {
        console.error('Error fetching project:', err);
        setErrorDetails(err?.response?.data || err);
        // If unauthorized, redirect to signin so the user can authenticate
        if (
          (err && err.statusCode === 401) ||
          (err && err.status === 401) ||
          err?.response?.status === 401
        ) {
          console.warn(
            'Project fetch returned 401 — unauthenticated. Showing sign-in/demo options.'
          );
          // Set unauthenticated so the UI can show a friendly call-to-action instead of forcing a redirect.
          setUnauthenticated(true);
          setLoading(false);
          return;
        }

        // If server returned 404 or route not found, fall back to a local demo or cached temp project
        const msg =
          (err &&
            (err.message || err?.data?.message || 'Failed to load project')) ||
          'Failed to load project';
        if (
          (err && (err.statusCode === 404 || err.status === 404)) ||
          /route not found/i.test(String(msg))
        ) {
          // Try local temp project
          try {
            const temp =
              typeof window !== 'undefined' &&
              localStorage.getItem('cipherstudio-temp');
            if (temp) {
              const parsed = JSON.parse(temp);
              setProject(parsed);
              setError(
                'Project not found on server — loaded local temp project'
              );
              return;
            }
          } catch (e) {
            // ignore localStorage parse errors
          }

          // final fallback to bundled demo files
          setProject({
            name: 'Demo (fallback)',
            files: demoInitialFiles,
            description: 'Fallback demo project',
          });
          setError('Project not found on server — showing demo fallback');
          setErrorDetails(err?.response?.data || err);
          return;
        }
        setError(msg || 'Failed to load project');
        setErrorDetails(err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, fetchProjectById, router]);

  // Stable file-change callback: always declare hooks (useCallback) before any conditional returns
  // so the order of hooks remains stable across renders.
  const handleFilesChange = useCallback(
    (files) => {
      setProject((prev) => {
        // If files reference didn't change, skip updating state to avoid needless re-renders
        if (prev && prev.files === files) return prev;
        return { ...(prev || {}), files };
      });
    },
    [setProject]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-slate-400">
        Loading project...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-red-500">
        <div className="mb-4">{error}</div>
        {errorDetails && (
          <pre className="bg-gray-800 text-left p-4 rounded text-xs max-w-3xl overflow-auto text-gray-200">
            {JSON.stringify(errorDetails, null, 2)}
          </pre>
        )}
        {unauthenticated ? (
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                setProject({
                  name: 'Demo (fallback)',
                  files: demoInitialFiles,
                  description: 'Local demo',
                });
                setError(null);
                setErrorDetails(null);
                setUnauthenticated(false);
              }}
              className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
            >
              Open demo without login
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1 rounded border text-sm"
            >
              Go to home / sign in
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div
        className="border-b p-3 pt-4"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--card-foreground)',
        }}
      >
        <div className="pt-1">
          <ProjectManager project={project} setProject={setProject} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <IDE
          initialFiles={project?.files || {}}
          onFilesChange={handleFilesChange}
          projectId={id}
          project={project}
          setProject={setProject}
        />
      </div>
    </div>
  );
}
