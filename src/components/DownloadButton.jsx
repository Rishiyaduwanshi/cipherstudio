"use client";
import React, { useState } from "react";
import { downloadProjectAsZip } from "@/handlers/downloadProject";
import { toast } from "react-toastify";

export default function DownloadButton({
  project,
  className = "",
  label = "Download",
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!project) {
      toast.error("No project to download");
      return;
    }

    setIsDownloading(true);

    try {
      const result = await downloadProjectAsZip(project);

      if (result.success) {
        toast.success(
          `Project "${project.name || "Unnamed"}" downloaded as zip`,
        );
      } else {
        toast.error(result.error || "Failed to download project");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download project");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading || !project}
      className={
        className ||
        "px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
      }
      title="Download project as ZIP file"
    >
      {isDownloading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          Preparing...
        </span>
      ) : (
        <span className="flex items-center gap-2">📦 {label}</span>
      )}
    </button>
  );
}
