/**
 * Utility functions for file path operations
 * Centralizes path-related helpers to avoid code repetition
 */

/**
 * Check if a path is a folder (doesn't have file extension)
 * @param {string} path - File or folder path
 * @returns {boolean} True if folder
 */
export function isFolder(path) {
	if (!path) return false;
	return !/\.[\w\d]+$/.test(path);
}

/**
 * Clean file path - remove leading slashes and normalize
 * @param {string} path - File path
 * @returns {string} Cleaned path
 */
export function cleanPath(path) {
	if (!path) return '';
	return path.startsWith('/') ? path.slice(1) : path;
}

/**
 * Normalize path slashes
 * @param {string} path - File path
 * @returns {string} Normalized path
 */
export function normalizePath(path) {
	if (!path) return '';
	return path.replace(/\/+/g, '/');
}

/**
 * Get parent directory path
 * @param {string} path - File or folder path
 * @returns {string} Parent directory path
 */
export function getParentPath(path) {
	if (!path) return '/';
	const lastSlash = path.lastIndexOf('/');
	return lastSlash === 0 ? '/' : path.slice(0, lastSlash);
}

/**
 * Join path segments
 * @param {...string} segments - Path segments to join
 * @returns {string} Joined and normalized path
 */
export function joinPath(...segments) {
	return normalizePath(segments.filter(Boolean).join('/'));
}

/**
 * Check if a path starts with another path (for folder checking)
 * @param {string} path - Path to check
 * @param {string} prefix - Prefix path
 * @returns {boolean} True if path starts with prefix
 */
export function pathStartsWith(path, prefix) {
	if (!path || !prefix) return false;
	const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
	return path === prefix || path.startsWith(normalizedPrefix);
}

/**
 * Get all files that are children of a folder path
 * @param {Object} files - Files object
 * @param {string} folderPath - Folder path
 * @returns {Array} Array of file paths
 */
export function getChildFiles(files, folderPath) {
	if (!files || !folderPath) return [];
	const prefix = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
	return Object.keys(files).filter(
		(k) => k === folderPath || k.startsWith(prefix)
	);
}

/**
 * Rename path (file or folder)
 * @param {string} oldPath - Old path
 * @param {string} newName - New name (not full path)
 * @returns {string} New full path
 */
export function renamePath(oldPath, newName) {
	const parent = getParentPath(oldPath);
	if (parent === '/') {
		// For root level files/folders, ensure leading slash
		return '/' + newName;
	}
	return joinPath(parent, newName);
}
