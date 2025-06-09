import React, { useState } from 'react';
import { ChancePercentageEditor } from '../ChancePercentageEditor';
import { PhotoManager } from '../PhotoManager';
import { useTheme } from '../../../hooks/useTheme';
import type { Participant } from '../../../domain/participant/entities';
import './styles.css';

interface AppSettingsProps {
  onClose: () => void;
  participants?: Participant[];
  onUpdateChancePercentage?: (participantId: string, newValue: number) => void;
  dbData?: {
    weeklyParticipants: any[];
    dailyParticipants: any[];
    animatorHistory: any[];
  };
  stats?: { [key: string]: number };
}

type SettingsTab = 'general' | 'chances' | 'photos' | 'data' | 'advanced';

export const AppSettings: React.FC<AppSettingsProps> = ({ 
  onClose, 
  participants = [],
  onUpdateChancePercentage,
  dbData,
  stats
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { theme, setTheme, themes } = useTheme();

  const renderGeneralTab = () => (
    <div className="settings-section">
      <h3>🎨 Apparence</h3>
      <div className="setting-item">
        <label>Thème de l'application</label>
        <div className="theme-grid">
          {Object.entries(themes).map(([themeKey, themeInfo]) => (
            <button
              key={themeKey}
              className={`theme-card ${theme === themeKey ? 'active' : ''}`}
              onClick={() => setTheme(themeKey as any)}
            >
              <span className="theme-emoji">{themeInfo.emoji}</span>
              <span className="theme-name">{themeInfo.displayName}</span>
              <span className="theme-desc">{themeInfo.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChancesTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>🎲 Gestion des Chances</h3>
        <p>Ajustez les probabilités de sélection pour chaque participant</p>
      </div>
      
      {participants.length > 0 && onUpdateChancePercentage ? (
        <div className="chance-editor-container">
          <ChancePercentageEditor
            participants={participants}
            onUpdateChancePercentage={onUpdateChancePercentage}
          />
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🎯</span>
          <h4>Aucun participant</h4>
          <p>Les participants apparaîtront ici une fois chargés</p>
        </div>
      )}
    </div>
  );

  const renderPhotosTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>📸 Gestion des Photos</h3>
        <p>Gérez les photos des participants</p>
      </div>
      
      <div className="photo-manager-container">
        {participants.length > 0 ? (
          <PhotoManager 
            participants={participants}
            onUpdatePhoto={(id, url) => {
              console.log('Photo updated:', id, url);
              // TODO: Implement photo update logic
            }}
          />
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📷</span>
            <h4>Aucun participant</h4>
            <p>Les participants apparaîtront ici une fois chargés</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>📊 Données de l'Application</h3>
        <p>Visualisez et gérez les données stockées</p>
      </div>
      
      {dbData ? (
        <div className="data-overview">
          <div className="data-stats">
            <div className="stat-item">
              <span className="stat-label">Participants Hebdomadaires</span>
              <span className="stat-value">{dbData.weeklyParticipants.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Participants Quotidiens</span>
              <span className="stat-value">{dbData.dailyParticipants.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Historique Animateurs</span>
              <span className="stat-value">{dbData.animatorHistory.length}</span>
            </div>
          </div>
          
          {stats && Object.keys(stats).length > 0 && (
            <div className="detailed-stats">
              <h4>Statistiques détaillées</h4>
              <div className="stats-grid">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="stat-card">
                    <span className="stat-name">{key}</span>
                    <span className="stat-number">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h4>Données non disponibles</h4>
          <p>Les données seront affichées une fois connecté à la base</p>
        </div>
      )}
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="settings-section">
      <div className="section-header">
        <h3>⚙️ Paramètres Avancés</h3>
        <p>Configuration technique et outils de développement</p>
      </div>
      
      <div className="advanced-options">
        <div className="option-group danger-zone">
          <h4>Zone de danger</h4>
          <button className="danger-btn">
            🗑️ Réinitialiser l'application
          </button>
          <button className="danger-btn">
            📤 Exporter les données
          </button>
        </div>
      </div>
    </div>
  );

  const tabConfig = {
    general: { icon: '🎨', label: 'Général', content: renderGeneralTab },
    chances: { icon: '🎲', label: 'Chances', content: renderChancesTab },
    photos: { icon: '📸', label: 'Photos', content: renderPhotosTab },
    data: { icon: '📊', label: 'Données', content: renderDataTab },
    advanced: { icon: '⚙️', label: 'Avancé', content: renderAdvancedTab },
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Paramètres de l'Application</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-tabs">
          {Object.entries(tabConfig).map(([key, config]) => (
            <button
              key={key}
              className={`settings-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key as SettingsTab)}
            >
              <span className="tab-icon">{config.icon}</span>
              <span className="tab-label">{config.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {tabConfig[activeTab].content()}
        </div>
      </div>
    </div>
  );
};

export default AppSettings; 