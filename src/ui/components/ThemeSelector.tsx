import React from 'react';
import { useTheme, type ThemeType } from '../../contexts/ThemeContext';
import './ThemeSelector.css';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="theme-selector">
      <div className="theme-selector-header">
        <span className="theme-selector-icon">🎨</span>
        <span className="theme-selector-title">Thème</span>
      </div>
      
      <div className="theme-options">
        {Object.entries(themes).map(([themeKey, themeInfo]) => (
          <button
            key={themeKey}
            className={`theme-option ${theme === themeKey ? 'active' : ''}`}
            onClick={() => setTheme(themeKey as ThemeType)}
            title={themeInfo.description}
          >
            <span className="theme-emoji">{themeInfo.emoji}</span>
            <span className="theme-name">{themeInfo.displayName}</span>
            {theme === themeKey && (
              <div className="theme-active-indicator">
                <div className="active-dot"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}; 