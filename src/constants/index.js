
// App Configuration
export const APP_CONFIG = Object.freeze({
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CipherStudio',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  DEFAULT_THEME: 'dark',
});

// API Configuration
export const API_CONFIG = Object.freeze({
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  API_VERSION: 'v1',
  TIMEOUT: 45000,
  SERVER_SELECTION_TIMEOUT: 5000,
});

// HTTP Status Codes
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
});

// Route Paths
export const ROUTES = Object.freeze({
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id) => `/projects/${id}`,
});

// Validation Limits
export const VALIDATION = Object.freeze({
  PROJECT_NAME_MIN: 3,
  PROJECT_NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
});

// UI Constants
export const UI = Object.freeze({
  SPINNER_CLASS: 'animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent',
  MINI_SPINNER_CLASS: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500',
  VIEWPORT_HEIGHT: 'calc(100vh-4rem)',
  BUTTON_PRIMARY: 'px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-500',
  BUTTON_DANGER: 'p-2 text-red-400 hover:text-red-500 transition-colors',
});

// Default export for backward compatibility
export default APP_CONFIG;

