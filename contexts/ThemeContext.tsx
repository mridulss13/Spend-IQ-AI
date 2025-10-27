'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        } else {
          // No saved theme, check system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(systemPrefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        // Fallback to system preference if localStorage fails
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
      }
      setMounted(true);
    };

    initializeTheme();
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      
      // Save to localStorage
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }

      // Apply theme class
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 