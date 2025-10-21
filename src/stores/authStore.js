import { create } from 'zustand';
import { toast } from 'react-toastify';
import axios from 'axios';

// Normalize API base so callers don't need to include /api/v1 in env
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
function normalizeApiRoot(raw) {
  if (!raw) return 'http://localhost:5000/api/v1';
  let r = String(raw).trim().replace(/\/+$/, '');
  if (!/\/api\/v\d+/i.test(r)) {
    r = `${r}/api/v1`;
  }
  return r;
}
const API_ROOT = normalizeApiRoot(RAW_API_BASE);
const AUTH_URL = `${API_ROOT}/auth`;

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,

  // Check if the user is authenticated
  isAuthenticated: () => {
    return !!get().user;
  },

  // Login function
  login: async (email, password) => {
    try {
      set({ loading: true });
      // Debug: log the auth URL being used (do not log password)
      console.info('Auth sign-in POST to:', `${AUTH_URL}/signin`, 'payload:', { email });
      const response = await axios.post(`${AUTH_URL}/signin`, { email, password }, { withCredentials: true });
      set({ user: response.data.data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message || error);
      set({ loading: false });
      // Return structured server response when available
      const serverData = error.response?.data;
      if (serverData) {
        return { success: false, error: serverData.message || 'Login failed', details: serverData };
      }
      return { success: false, error: error.message || 'Login failed' };
    }
  },

  // Logout function
  logout: async () => {
    try {
      set({ loading: true });
  await axios.post(`${AUTH_URL}/signout`, {}, { withCredentials: true });
      set({ user: null, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      set({ loading: false });
      return { success: false, error: error.response?.data?.message || 'Logout failed' };
    }
  },

  // Register function
  register: async (name, email, password) => {
    try {
      set({ loading: true });
  const response = await axios.post(`${AUTH_URL}/signup`, { name, email, password }, { withCredentials: true });
  set({ user: response.data.data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      set({ loading: false });
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  }
}));

export default useAuthStore;