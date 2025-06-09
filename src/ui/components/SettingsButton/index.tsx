import React from 'react';
import './styles.css';

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button className="settings-floating-btn" onClick={onClick} title="Paramètres">
      <span className="settings-icon">⚙️</span>
    </button>
  );
}; 