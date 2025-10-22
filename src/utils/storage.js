/**
 * Utility functions for localStorage operations
 * Centralizes all localStorage operations to avoid code repetition
 */

const STORAGE_KEYS = {
	THEME: 'cipherstudio-theme',
	TEMP_PROJECT: 'cipherstudio-temp',
	PROJECT_PREFIX: 'cipherstudio-project',
};

/**
 * Get item from localStorage and parse JSON
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export function getStorageItem(key, defaultValue = null) {
	try {
		const item = localStorage.getItem(key);
		return item ? JSON.parse(item) : defaultValue;
	} catch (error) {
		console.warn(`Failed to parse localStorage item: ${key}`, error);
		return defaultValue;
	}
}

/**
 * Set item in localStorage with JSON stringify
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function setStorageItem(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error(`Failed to set localStorage item: ${key}`, error);
		return false;
	}
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export function removeStorageItem(key) {
	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error(`Failed to remove localStorage item: ${key}`, error);
		return false;
	}
}

/**
 * Get all projects from localStorage
 * @returns {Array} Array of project entries
 */
export function getLocalProjects() {
	const projects = [];
	try {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith(STORAGE_KEYS.PROJECT_PREFIX)) {
				const project = getStorageItem(key);
				if (project) {
					projects.push({
						source: 'local',
						storageKey: key,
						name: project?.name || 'Local project',
						files: project?.files || {},
						project,
						listId: `local-${key}`,
					});
				}
			}
		}
	} catch (error) {
		console.error('Failed to get local projects', error);
	}
	return projects;
}

/**
 * Save project to localStorage with timestamp
 * @param {Object} project - Project object
 * @returns {string} Storage key used
 */
export function saveLocalProject(project) {
	const projectId = `${STORAGE_KEYS.PROJECT_PREFIX}-${Date.now()}`;
	setStorageItem(projectId, project);
	return projectId;
}

/**
 * Save temp project files to localStorage
 * @param {Object} files - Files object
 */
export function saveTempFiles(files) {
	setStorageItem(STORAGE_KEYS.TEMP_PROJECT, { files });
}

/**
 * Get temp project files from localStorage
 * @returns {Object|null} Files object or null
 */
export function getTempFiles() {
	const temp = getStorageItem(STORAGE_KEYS.TEMP_PROJECT);
	return temp?.files || null;
}

/**
 * Get theme from localStorage
 * @returns {string} Theme name (dark or light)
 */
export function getTheme() {
	return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
}

/**
 * Set theme in localStorage
 * @param {string} theme - Theme name
 */
export function setTheme(theme) {
	localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export { STORAGE_KEYS };
