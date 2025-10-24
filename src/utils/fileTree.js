/**
 * Tree Node class for file explorer
 */
class TreeNode {
  constructor(name, type = 'file', path = '') {
    this.name = name;
    this.type = type; 
    this.path = path;
    this.children = new Map(); 
    this.isExpanded = true; 
    this.content = '';
  }

  addChild(node) {
    this.children.set(node.name, node);
  }

  removeChild(name) {
    this.children.delete(name);
  }

  getChild(name) {
    return this.children.get(name);
  }

  hasChild(name) {
    return this.children.has(name);
  }

  getChildrenArray() {
    // Return sorted children (folders first, then files)
    return Array.from(this.children.values()).sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    });
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }
}

/**
 * File Tree Manager class
 */
export class FileTreeManager {
  constructor() {
    this.root = new TreeNode('root', 'folder', '/');
  }

  /**
   * Build tree from files object
   */
  buildFromFiles(files) {
    // Save expanded states before rebuilding
    const expandedStates = new Map();
    this.saveExpandedStates(this.root, expandedStates);
    
    this.root = new TreeNode('root', 'folder', '/');
    
    Object.keys(files).forEach(filePath => {
      this.addFile(filePath, files[filePath]);
    });

    // Restore expanded states after rebuilding
    this.restoreExpandedStates(this.root, expandedStates);

    return this.root;
  }

  /**
   * Save expanded states recursively
   */
  saveExpandedStates(node, statesMap) {
    if (!node) return;
    
    if (node.type === 'folder' && node.path) {
      statesMap.set(node.path, node.isExpanded);
    }
    
    if (node.children) {
      for (const child of node.children.values()) {
        this.saveExpandedStates(child, statesMap);
      }
    }
  }

  /**
   * Restore expanded states recursively
   */
  restoreExpandedStates(node, statesMap) {
    if (!node) return;
    
    if (node.type === 'folder' && node.path && statesMap.has(node.path)) {
      node.isExpanded = statesMap.get(node.path);
    }
    
    if (node.children) {
      for (const child of node.children.values()) {
        this.restoreExpandedStates(child, statesMap);
      }
    }
  }

  /**
   * Add a file to the tree
   */
  addFile(filePath, fileContent) {
    const parts = filePath.split('/').filter(Boolean);
    let currentNode = this.root;
    let currentPath = '';

    // Navigate/create path
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath += '/' + part;
      
      if (!currentNode.hasChild(part)) {
        const isLastPart = i === parts.length - 1;
        const nodeType = isLastPart ? 'file' : 'folder';
        const newNode = new TreeNode(part, nodeType, currentPath);
        
        if (isLastPart && fileContent) {
          newNode.content = typeof fileContent === 'string' ? fileContent : (fileContent.code || fileContent.content || '');
        }
        
        currentNode.addChild(newNode);
      }
      
      currentNode = currentNode.getChild(part);
    }
  }

  /**
   * Remove a file from the tree
   */
  removeFile(filePath) {
    const parts = filePath.split('/').filter(Boolean);
    if (parts.length === 0) return false;

    let currentNode = this.root;
    const pathNodes = [currentNode];

    // Navigate to the parent
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!currentNode.hasChild(part)) return false;
      
      currentNode = currentNode.getChild(part);
      pathNodes.push(currentNode);
    }

    // Remove the file
    const fileName = parts[parts.length - 1];
    if (!currentNode.hasChild(fileName)) return false;
    
    currentNode.removeChild(fileName);

    // Clean up empty folders
    this.cleanupEmptyFolders(pathNodes, parts);
    
    return true;
  }

  /**
   * Clean up empty folders after file deletion
   */
  cleanupEmptyFolders(pathNodes, parts) {
    for (let i = pathNodes.length - 1; i > 0; i--) {
      const node = pathNodes[i];
      const parentNode = pathNodes[i - 1];
      
      if (node.type === 'folder' && node.children.size === 0) {
        parentNode.removeChild(node.name);
      } else {
        break; // Stop if we find a non-empty folder
      }
    }
  }

  /**
   * Get all files as flat object
   */
  getFilesObject() {
    const files = {};
    
    const traverse = (node) => {
      if (node.type === 'file') {
        files[node.path] = { code: node.content };
      }
      
      node.getChildrenArray().forEach(child => {
        traverse(child);
      });
    };

    traverse(this.root);
    return files;
  }

  /**
   * Toggle folder expanded state
   */
  toggleFolder(folderPath) {
    const parts = folderPath.split('/').filter(Boolean);
    let currentNode = this.root;

    for (const part of parts) {
      if (!currentNode.hasChild(part)) return false;
      currentNode = currentNode.getChild(part);
    }

    if (currentNode.type === 'folder') {
      currentNode.toggleExpanded();
      return true;
    }
    
    return false;
  }

  /**
   * Check if a path exists
   */
  pathExists(filePath) {
    const parts = filePath.split('/').filter(Boolean);
    let currentNode = this.root;

    for (const part of parts) {
      if (!currentNode.hasChild(part)) return false;
      currentNode = currentNode.getChild(part);
    }

    return true;
  }
}