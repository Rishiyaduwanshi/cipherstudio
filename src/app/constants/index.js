
export default Object.freeze({
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'CipherStudio',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  DEFAULT_THEME: 'dark',
});
