"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import IDE from "@/components/IDE";
import ProjectManager from "@/components/ProjectManager";
import useProjectStore from "@/stores/projectStore";
import { initialFiles as demoInitialFiles } from "@/data/initialProject-react";
import { getTempFiles } from "@/utils/storage";
import { normalizeFiles } from "@/utils/fileHelpers";
import { HTTP_STATUS, ROUTES } from "@/constants";

export default function EditorPage({ params }) {
  const router = useRouter();
  const { fetchProjectById } = useProjectStore();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [unauthenticated, setUnauthenticated] = useState(false);

  const resolvedParams =
    typeof React.use === "function" ? React.use(params) : params;
  const id = resolvedParams?.id;

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      try {
        const proj = await fetchProjectById(id);
        const normalized = { ...(proj || {}) };
        normalized.files = normalizeFiles(proj?.files);
        console.info(
          "Loaded project; files normalized ->",
          Object.keys(normalized.files || {}).length,
          "files",
        );
        setProject(normalized);
      } catch (err) {
        console.error("Error fetching project:", err);
        setErrorDetails(err?.response?.data || err);
        if (
          (err && err.statusCode === HTTP_STATUS.UNAUTHORIZED) ||
          (err && err.status === HTTP_STATUS.UNAUTHORIZED) ||
          err?.response?.status === HTTP_STATUS.UNAUTHORIZED
        ) {
          console.warn(
            "Project fetch returned 401 — unauthenticated. Showing sign-in/demo options.",
          );
          setUnauthenticated(true);
          setLoading(false);
          return;
        }

        const msg =
          (err &&
            (err.message || err?.data?.message || "Failed to load project")) ||
          "Failed to load project";
        if (
          (err &&
            (err.statusCode === HTTP_STATUS.NOT_FOUND ||
              err.status === HTTP_STATUS.NOT_FOUND)) ||
          /route not found/i.test(String(msg))
        ) {
          try {
            const tempFiles = getTempFiles();
            if (tempFiles) {
              setProject({ files: tempFiles });
              setError(
                "Project not found on server — loaded local temp project",
              );
              return;
            }
          } catch (e) {}

          setProject({
            name: "Demo (fallback)",
            files: demoInitialFiles,
            description: "Fallback demo project",
          });
          setError("Project not found on server — showing demo fallback");
          setErrorDetails(err?.response?.data || err);
          return;
        }
        setError(msg || "Failed to load project");
        setErrorDetails(err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, fetchProjectById, router]);

  const handleFilesChange = useCallback(
    (files) => {
      setProject((prev) => {
        if (prev && prev.files === files) return prev;
        return { ...(prev || {}), files };
      });
    },
    [setProject],
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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-destructive">
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
                  name: "Demo (fallback)",
                  files: demoInitialFiles,
                  description: "Local demo",
                });
                setError(null);
                setErrorDetails(null);
                setUnauthenticated(false);
              }}
              className="px-3 py-1 rounded bg-primary text-white text-sm hover:bg-primary-hover transition-colors"
            >
              Open demo without login
            </button>
            <button
              onClick={() => router.push(ROUTES.HOME)}
              className="px-3 py-1 rounded border text-sm hover:bg-secondary transition-colors"
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
          background: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--card-foreground)",
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
