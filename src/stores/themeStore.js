import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
  theme: 'dark',
  mounted: false,

  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('cipherstudio-theme') || 'dark';
      document.documentElement.className = savedTheme;
      set({ theme: savedTheme, mounted: true });
    }
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    set({ theme: newTheme });
    localStorage.setItem('cipherstudio-theme', newTheme);
    document.documentElement.className = newTheme;
  },

  setTheme: (newTheme) => {
    set({ theme: newTheme });
    localStorage.setItem('cipherstudio-theme', newTheme);
    document.documentElement.className = newTheme;
  }
}));

export default useThemeStore;