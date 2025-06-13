import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type ThemeType = 'dark' | 'white' | 'unicorn';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: {
    [key in ThemeType]: {
      name: string;
      displayName: string;
      description: string;
      emoji: string;
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');

  const themes = {
    dark: {
      name: 'dark',
      displayName: 'Dark Mode',
      description: 'Mode sombre élégant',
      emoji: '🌙'
    },
    white: {
      name: 'white',
      displayName: 'White Mode',
      description: 'Mode clair et lumineux',
      emoji: '☀️'
    },
    unicorn: {
      name: 'unicorn',
      displayName: 'Mode Licorne Pastel',
      description: 'Mode magique et coloré avec effets pastels',
      emoji: '🦄✨'
    }
  } as const;

  // Charger le thème depuis le localStorage au démarrage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme && Object.keys(themes).includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Sauvegarder le thème et appliquer les classes CSS
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Supprimer toutes les classes de thème existantes
    document.documentElement.classList.remove('theme-dark', 'theme-white', 'theme-unicorn');
    
    // Ajouter la nouvelle classe de thème
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 