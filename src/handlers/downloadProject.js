import JSZip from 'jszip';


export async function downloadProjectAsZip(project) {
  try {
    if (!project || !project.files) {
      throw new Error('Invalid project data');
    }

    const zip = new JSZip();
    const projectName = project.name || 'project';
    
    
    const rootFolder = zip.folder(projectName);
    
    Object.entries(project.files).forEach(([filePath, fileData]) => {
      
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      
      const content = typeof fileData === 'string' 
        ? fileData 
        : fileData?.code || fileData?.content || '';

      
      if (cleanPath) {
        rootFolder.file(cleanPath, content);
      }
    });

    
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9 
      }
    });

    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Failed to download project as zip:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create zip file' 
    };
  }
}


export async function downloadFilesAsZip(files, projectName = 'project') {
  try {
    if (!files || typeof files !== 'object') {
      throw new Error('Invalid files data');
    }

    const zip = new JSZip();

    
    Object.entries(files).forEach(([filePath, fileData]) => {
      
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      
      const content = typeof fileData === 'string' 
        ? fileData 
        : fileData?.code || fileData?.content || '';

      
      if (cleanPath) {
        zip.file(cleanPath, content);
      }
    });

    
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9 
      }
    });

    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('Failed to download files as zip:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create zip file' 
    };
  }
}

export default downloadProjectAsZip;
