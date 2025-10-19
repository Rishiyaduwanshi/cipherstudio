'use client';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import useAuthStore from '@/stores/authStore';
import useThemeStore from '@/stores/themeStore';

const ClientProviders = ({ children }) => {
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
    initializeAuth();
  }, [initializeAuth, initializeTheme]);

  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          backgroundColor: '#1e293b',
          color: '#ffffff',
          border: '1px solid #334155'
        }}
        progressStyle={{
          backgroundColor: '#6366f1'
        }}
      />
    </>
  );
};

export default ClientProviders;