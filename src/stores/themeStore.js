import { create } from 'zustand';
import { getTheme, setTheme as saveTheme } from '@/utils/storage';

const useThemeStore = create((set, get) => ({
  theme: 'dark',
  mounted: false,

  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const savedTheme = getTheme();
      // Use classList to only toggle the `light` class so we don't remove other classes
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
      set({ theme: savedTheme, mounted: true });
    }
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    set({ theme: newTheme });
    saveTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  },

  setTheme: (newTheme) => {
    set({ theme: newTheme });
    saveTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }
}));

export default useThemeStore;