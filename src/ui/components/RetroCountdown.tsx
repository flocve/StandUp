import React, { useState, useEffect } from 'react';
import { getRetroInfo } from '../../utils/retroUtils';
import './RetroCountdown.css';

interface RetroInfo {
  date: Date;
  daysUntil: number;
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
}

export const RetroCountdown: React.FC = () => {
  const [retroInfo, setRetroInfo] = useState<RetroInfo | null>(null);

  useEffect(() => {
    // Fonction pour mettre à jour les informations de la rétro
    const updateRetroInfo = () => {
      const info = getRetroInfo();
      setRetroInfo(info);
    };

    // Mise à jour initiale
    updateRetroInfo();

    // Mise à jour toutes les heures pour rester précis
    const interval = setInterval(updateRetroInfo, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  if (!retroInfo) {
    return null;
  }

  const { daysUntil, formattedDate, isToday, isTomorrow } = retroInfo;

  const getCountdownText = () => {
    if (isToday) {
      return "C'est aujourd'hui !";
    } else if (isTomorrow) {
      return "C'est demain !";
    } else if (daysUntil === 0) {
      return "Rétro terminée";
    } else {
      return `${daysUntil} jour${daysUntil > 1 ? 's' : ''}`;
    }
  };

  const getStatusClass = () => {
    if (isToday) return 'today';
    if (isTomorrow) return 'tomorrow';
    if (daysUntil <= 3) return 'soon';
    if (daysUntil <= 7) return 'week';
    return 'distant';
  };

  const getEmoji = () => {
    return '⭐';
  };

  return (
    <div className={`retro-countdown ${getStatusClass()}`}>
      <div className="countdown-content">
        <div className="block-header">
          <div className="block-header-left">
            <span className="block-emoji" style={{ paddingBottom: '10px' }}>{getEmoji()}</span>
            <h3 className="block-title">Prochaine Rétro</h3>
          </div>
        </div>
        
        <div className="countdown-main">
          <div className="countdown-number">
            {getCountdownText()}
          </div>
          <div className="countdown-date">
            {formattedDate}
          </div>
        </div>

        {!isToday && !isTomorrow && (
          <div className="countdown-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${Math.max(10, Math.min(90, (30 - daysUntil) / 30 * 100))}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="countdown-glow"></div>
    </div>
  );
}; 