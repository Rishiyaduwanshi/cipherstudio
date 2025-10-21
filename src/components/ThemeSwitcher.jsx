"use client"
import React, { useState, useEffect } from "react";

export default function ThemeSwitcher() {
  const [isDark, setIsDark] = useState(true);

  // Apply persisted theme and ensure DOM updates only run on the client
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('cipherstudio-theme');
      if (savedTheme) {
        const dark = savedTheme === 'dark';
        setIsDark(dark);
        // The CSS file defines a `.light` class to enable the light theme.
        // Default is the dark theme (variables in :root). So add/remove that class accordingly.
        if (dark) {
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
        }
      } else {
        // If no preference saved, default to dark mode and ensure light class is not present
        document.documentElement.classList.remove('light');
      }
    } catch (e) {
      // localStorage might be unavailable in some environments — ignore errors
      console.warn('Theme load failed', e);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      localStorage.setItem('cipherstudio-theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      // ignore storage errors
    }

    // Toggle the `.light` class — dark is the default/base theme
    if (newTheme) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 flex items-center space-x-1"
      aria-pressed={!isDark}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span>{isDark ? '🌙' : '☀️'}</span>
      <span>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}