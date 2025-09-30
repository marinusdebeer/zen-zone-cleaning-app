'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const html = document.documentElement;
    
    // Get saved manual theme and timestamp
    const manualTheme = localStorage.getItem('theme') as Theme | null;
    const manualTimestamp = parseInt(localStorage.getItem('theme_timestamp') || '0', 10);
    
    // Get saved system theme and timestamp
    const systemThemeSaved = localStorage.getItem('system_theme') as Theme | null;
    const systemTimestamp = parseInt(localStorage.getItem('system_theme_timestamp') || '0', 10);
    
    // Get current system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const currentSystemTheme = mediaQuery.matches ? 'dark' : 'light';
    const now = Date.now();
    
    // Check if system theme changed since last visit
    let actualSystemTimestamp = systemTimestamp;
    if (currentSystemTheme !== systemThemeSaved) {
      // System theme changed while app was closed
      actualSystemTimestamp = now;
      localStorage.setItem('system_theme', currentSystemTheme);
      localStorage.setItem('system_theme_timestamp', now.toString());
    }
    
    // Determine which theme to use based on most recent change
    let activeTheme: Theme;
    if (manualTimestamp > actualSystemTimestamp) {
      // User's manual toggle is more recent
      activeTheme = manualTheme || currentSystemTheme;
    } else {
      // System theme is more recent (or equal)
      activeTheme = currentSystemTheme;
    }
    
    setTheme(activeTheme);
    html.classList.toggle('dark', activeTheme === 'dark');
    
    // Listen for system theme changes while app is running
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      const changeTime = Date.now();
      
      // Store system theme change
      localStorage.setItem('system_theme', newSystemTheme);
      localStorage.setItem('system_theme_timestamp', changeTime.toString());
      
      // Check if user has manually set theme after this system change
      const currentManualTimestamp = parseInt(localStorage.getItem('theme_timestamp') || '0', 10);
      
      if (currentManualTimestamp > changeTime) {
        // User's manual preference is more recent, don't override
        return;
      }
      
      // System change is more recent, follow it
      setTheme(newSystemTheme);
      html.classList.toggle('dark', e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    const timestamp = Date.now();
    
    // Save theme and timestamp
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('theme_timestamp', timestamp.toString());
    
    // Update DOM
    const html = document.documentElement;
    html.classList.toggle('dark', newTheme === 'dark');
    
    // Force browser reflow
    void html.offsetHeight;
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
