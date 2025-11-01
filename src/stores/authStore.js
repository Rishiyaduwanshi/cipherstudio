import { create } from "zustand";
import axios from "axios";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
function normalizeApiRoot(raw) {
  if (!raw) return "";
  let r = String(raw).trim().replace(/\/+$/, "");
  if (!/\/api\/v\d+/i.test(r)) r = `${r}/api/v1`;
  return r;
}
const API_ROOT = normalizeApiRoot(RAW_API_BASE) || "/api/v1";
const AUTH_BASE = `${API_ROOT}/auth`;
const SIGNIN_URL = `${AUTH_BASE}/signin`;
const SIGNUP_URL = `${AUTH_BASE}/signup`;
const SIGNOUT_URL = `${AUTH_BASE}/signout`;

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,

  isAuthenticated: () => {
    return !!get().user;
  },

  login: async (email, password) => {
    try {
      set({ loading: true });
      console.info("Auth sign-in POST to:", SIGNIN_URL, "payload:", { email });
      const response = await axios.post(
        SIGNIN_URL,
        { email, password },
        { withCredentials: true },
      );
      set({ user: response.data.data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error(
        "Login error:",
        error.response?.data || error.message || error,
      );
      set({ loading: false });
      const serverData = error.response?.data;
      if (serverData) {
        return {
          success: false,
          error: serverData.message || "Login failed",
          details: serverData,
        };
      }
      return { success: false, error: error.message || "Login failed" };
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await axios.post(SIGNOUT_URL, {}, { withCredentials: true });
      set({ user: null, loading: false });
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || "Logout failed",
      };
    }
  },

  register: async (name, email, password) => {
    try {
      set({ loading: true });
      const response = await axios.post(
        SIGNUP_URL,
        { name, email, password },
        { withCredentials: true },
      );
      set({ user: response.data.data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  },
}));

export default useAuthStore;
