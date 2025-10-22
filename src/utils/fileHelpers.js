/**
 * Utility functions for file operations
 * Centralizes file-related helpers to avoid code repetition
 */

/**
 * Clean file path - remove leading slashes
 * @param {string} path - File path
 * @returns {string} Cleaned path
 */
export function cleanPath(path) {
	if (!path) return '';
	return path.startsWith('/') ? path.slice(1) : path;
}

/**
 * Get programming language based on file extension
 * @param {string} filePath - File path or name
 * @returns {string} Language identifier for Monaco Editor
 */
export function getLanguage(filePath) {
	if (!filePath) return 'javascript';
	const ext = filePath.split('.').pop()?.toLowerCase();
	
	switch (ext) {
		case 'js':
		case 'jsx':
			return 'javascript';
		case 'ts':
		case 'tsx':
			return 'typescript';
		case 'css':
			return 'css';
		case 'html':
			return 'html';
		case 'json':
			return 'json';
		case 'md':
		case 'markdown':
			return 'markdown';
		case 'py':
			return 'python';
		case 'java':
			return 'java';
		case 'cpp':
		case 'c':
			return 'cpp';
		case 'xml':
			return 'xml';
		case 'sql':
			return 'sql';
		case 'yml':
		case 'yaml':
			return 'yaml';
		default:
			return 'javascript';
	}
}

/**
 * Get file icon emoji based on file extension
 * @param {string} fileName - File name or path
 * @returns {string} Emoji icon
 */
export function getFileIcon(fileName) {
	if (!fileName) return '📄';
	const ext = fileName.split('.').pop()?.toLowerCase();
	
	switch (ext) {
		case 'js':
			return '📄';
		case 'jsx':
			return '⚛️';
		case 'ts':
		case 'tsx':
			return '🟦';
		case 'css':
			return '🎨';
		case 'html':
			return '🌐';
		case 'json':
			return '📋';
		case 'md':
		case 'markdown':
			return '📝';
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'gif':
		case 'svg':
			return '🖼️';
		case 'py':
			return '🐍';
		case 'java':
			return '☕';
		case 'xml':
			return '📜';
		case 'pdf':
			return '📕';
		default:
			return '📄';
	}
}

/**
 * Normalize files object to ensure consistent format
 * Handles arrays, objects, strings, and various formats
 * @param {*} files - Files in any format
 * @returns {Object} Normalized files object with { path: { code } } format
 */
export function normalizeFiles(files) {
	if (!files) return {};
	
	// Handle array format
	if (Array.isArray(files)) {
		return files.reduce((acc, item) => {
			const path = item?.path || item?.filePath || item?.name || item?.filename || '/untitled';
			const code = typeof item === 'string' 
				? item 
				: (item?.code || item?.content || item?.value || '');
			acc[path] = { code };
			return acc;
		}, {});
	}

	// Handle object format
	if (typeof files === 'object') {
		const out = {};
		Object.entries(files).forEach(([k, v]) => {
			if (typeof v === 'string') {
				out[k] = { code: v };
			} else if (v && typeof v === 'object') {
				if ('code' in v) {
					out[k] = v;
				} else if ('content' in v) {
					out[k] = { code: v.content };
				} else {
					out[k] = { code: JSON.stringify(v) };
				}
			} else {
				out[k] = { code: '' };
			}
		});
		return out;
	}

	return {};
}

/**
 * Get file content from a file object
 * @param {*} fileData - File data in various formats
 * @returns {string} File content
 */
export function getFileContent(fileData) {
	if (typeof fileData === 'string') {
		return fileData;
	}
	return fileData?.code || fileData?.content || '';
}

/**
 * Get file name from path
 * @param {string} filePath - Full file path
 * @returns {string} File name
 */
export function getFileName(filePath) {
	if (!filePath) return '';
	return filePath.split('/').pop() || filePath;
}

/**
 * Get file extension from path
 * @param {string} filePath - Full file path
 * @returns {string} File extension (without dot)
 */
export function getFileExtension(filePath) {
	if (!filePath) return '';
	return filePath.split('.').pop()?.toLowerCase() || '';
}
