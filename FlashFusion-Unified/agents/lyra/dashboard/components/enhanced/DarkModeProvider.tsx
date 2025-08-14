'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored) {
      setTheme(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (theme: 'dark' | 'light') => {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      setActualTheme(theme);
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      applyTheme(systemTheme);

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    actualTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

// Enhanced theme toggle component
interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <button
      onClick={() => {
        if (theme === 'light') {
          setTheme('dark');
        } else if (theme === 'dark') {
          setTheme('system');
        } else {
          setTheme('light');
        }
      }}
      className={`
        relative p-2 rounded-lg border border-border bg-background
        hover:bg-accent hover:text-accent-foreground
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        transition-all duration-200
        ${className}
      `}
      title={`Current theme: ${theme}. Click to cycle through themes.`}
    >
      {/* Light mode icon */}
      <svg
        className={`
          h-4 w-4 transition-all duration-300
          ${actualTheme === 'light' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}
          absolute inset-0 m-auto
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>

      {/* Dark mode icon */}
      <svg
        className={`
          h-4 w-4 transition-all duration-300
          ${actualTheme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}
          absolute inset-0 m-auto
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>

      {/* System mode indicator */}
      {theme === 'system' && (
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
      )}
    </button>
  );
}

// Theme-aware gradient backgrounds
export const themeGradients = {
  primary: {
    light: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    dark: 'bg-gradient-to-br from-blue-950/50 to-indigo-950/50'
  },
  success: {
    light: 'bg-gradient-to-br from-green-50 to-emerald-100',
    dark: 'bg-gradient-to-br from-green-950/50 to-emerald-950/50'
  },
  warning: {
    light: 'bg-gradient-to-br from-yellow-50 to-orange-100',
    dark: 'bg-gradient-to-br from-yellow-950/50 to-orange-950/50'
  },
  error: {
    light: 'bg-gradient-to-br from-red-50 to-rose-100',
    dark: 'bg-gradient-to-br from-red-950/50 to-rose-950/50'
  }
};

// Hook for theme-aware styles
export function useThemeAware() {
  const { actualTheme } = useTheme();

  const getGradient = (type: keyof typeof themeGradients) => {
    return themeGradients[type][actualTheme];
  };

  const getTextColor = (variant: 'primary' | 'secondary' | 'muted' = 'primary') => {
    const colors = {
      primary: actualTheme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: actualTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
    };
    return colors[variant];
  };

  const getBorderColor = () => {
    return actualTheme === 'dark' ? 'border-gray-800' : 'border-gray-200';
  };

  const getCardBackground = () => {
    return actualTheme === 'dark' 
      ? 'bg-gray-900/50 backdrop-blur-sm' 
      : 'bg-white/50 backdrop-blur-sm';
  };

  return {
    actualTheme,
    getGradient,
    getTextColor,
    getBorderColor,
    getCardBackground
  };
}