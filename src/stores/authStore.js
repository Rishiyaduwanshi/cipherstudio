import { create } from 'zustand';
import { toast } from 'react-toastify';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  
  // Initialize auth state from cookies
  initializeAuth: () => {
    try {
      // Check if user data exists in cookies (server will validate token automatically)
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='));
      
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        set({ user: userData, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },

  // Login function
  login: async (email, password) => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: This sends cookies automatically
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Login failed');
        return { success: false, error: data.message };
      }

      const { user } = data.data;
      
      // Store user data in cookie (token will be httpOnly cookie from server)
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Strict`;
      
      set({ user });
      toast.success('Login successful! Welcome back 🎉');
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
      return { success: false, error: error.message };
    }
  },

  // Register function
  register: async (name, email, password) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Registration failed');
        return { success: false, error: data.message };
      }

      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Network error. Please try again.');
      return { success: false, error: error.message };
    }
  },

  // Logout function
  logout: async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear user cookie
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      set({ user: null, token: null });
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear client state
      document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      set({ user: null, token: null });
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const { user } = get();
    return !!user;
  }
}));

export default useAuthStore;