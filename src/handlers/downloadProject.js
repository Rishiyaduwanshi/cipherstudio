import JSZip from "jszip";
import { cleanPath, getFileContent } from "@/utils/fileHelpers";

/**
 * Downloads a project as a zip file containing all files in their folder structure
 * @param {Object} project - The project object with files
 * @param {Object} project.files - Object where keys are file paths and values contain code
 * @param {string} project.name - Name of the project
 */
export async function downloadProjectAsZip(project) {
  try {
    if (!project || !project.files) {
      throw new Error("Invalid project data");
    }

    const zip = new JSZip();
    const projectName = project.name || "project";

    // Create a root folder with the project name
    const rootFolder = zip.folder(projectName);

    // Add each file to the zip
    Object.entries(project.files).forEach(([filePath, fileData]) => {
      const cleanedPath = cleanPath(filePath);
      const content = getFileContent(fileData);

      if (cleanedPath) {
        rootFolder.file(cleanedPath, content);
      }
    });

    // Generate the zip file
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9, // Maximum compression
      },
    });

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Failed to download project as zip:", error);
    return {
      success: false,
      error: error.message || "Failed to create zip file",
    };
  }
}

export default downloadProjectAsZip;
