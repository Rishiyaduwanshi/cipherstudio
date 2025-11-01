"use client";
import { useState, useEffect, useCallback } from "react";
import { FileTreeManager } from "../utils/fileTree";

export function useFileTree(files) {
  const [treeManager] = useState(() => new FileTreeManager());
  const [tree, setTree] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Build tree when files change
  useEffect(() => {
    if (files) {
      treeManager.buildFromFiles(files);
      setRefreshKey((prev) => prev + 1);
    }
  }, [files, treeManager]);

  // Get current tree root
  const getTree = useCallback(() => {
    return treeManager.root;
  }, [treeManager, refreshKey]);

  // Toggle folder
  const toggleFolder = useCallback(
    (folderPath) => {
      const success = treeManager.toggleFolder(folderPath);
      if (success) {
        setRefreshKey((prev) => prev + 1);
      }
      return success;
    },
    [treeManager],
  );

  // Get children array with fallback
  const getChildren = useCallback(
    (node) => {
      if (node.getChildrenArray) {
        return node.getChildrenArray();
      }

      if (node.children && node.children instanceof Map) {
        return Array.from(node.children.values()).sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === "folder" ? -1 : 1;
        });
      }

      return [];
    },
    [refreshKey],
  );

  return {
    tree: getTree(),
    toggleFolder,
    getChildren,
    treeManager,
  };
}
