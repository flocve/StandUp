import React, { useState, useRef, useEffect } from 'react';
import { useTheme, type ThemeType } from '../../contexts/ThemeContext';
import './ThemeSelector.css';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleThemeSelect = (themeKey: ThemeType) => {
    setTheme(themeKey);
    setIsOpen(false);
  };

  const currentTheme = themes[theme];

  return (
    <div className="theme-selector" ref={dropdownRef}>
      <button 
        className={`theme-selector-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="theme-selector-current">
          <span className="theme-emoji">{currentTheme.emoji}</span>
          <span className="theme-name">{currentTheme.displayName}</span>
        </div>
        <div className={`theme-selector-arrow ${isOpen ? 'rotated' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>
      
      <div className={`theme-dropdown ${isOpen ? 'open' : ''}`}>
        <div className="theme-dropdown-header">
          <span className="theme-dropdown-icon">🎨</span>
          <span className="theme-dropdown-title">Choisir un thème</span>
        </div>
        
        <div className="theme-options" role="listbox">
          {Object.entries(themes).map(([themeKey, themeInfo]) => (
            <button
              key={themeKey}
              className={`theme-option ${theme === themeKey ? 'active' : ''}`}
              onClick={() => handleThemeSelect(themeKey as ThemeType)}
              title={themeInfo.description}
              role="option"
              aria-selected={theme === themeKey}
            >
              <span className="theme-emoji">{themeInfo.emoji}</span>
              <div className="theme-info">
                <span className="theme-display-name">{themeInfo.displayName}</span>
                <span className="theme-description">{themeInfo.description}</span>
              </div>
              {theme === themeKey && (
                <div className="theme-active-indicator">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 