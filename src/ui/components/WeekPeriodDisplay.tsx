import React from 'react';
import './WeekPeriodDisplay.css';

export const WeekPeriodDisplay: React.FC = () => {
  // Calculer la période de la semaine courante (lundi à vendredi seulement)
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Vendredi (4 jours après lundi)
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      weekNumber: getWeekNumber(now)
    };
  };

  // Calculer le numéro de semaine
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculer la progression des jours ouvrés (lundi = 1, vendredi = 5)
  const getWorkdayProgress = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi
    
    // Si c'est le weekend, on considère que la semaine est terminée
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 100; // 100% si weekend
    }
    
    // Lundi=1, Mardi=2, Mercredi=3, Jeudi=4, Vendredi=5
    const workday = dayOfWeek; // 1 à 5 pour lundi à vendredi
    return (workday / 5) * 100; // Pourcentage sur 5 jours
  };

  // Générer le label des jours ouvrés
  const getWorkdayLabel = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi
    
    // Si c'est le weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "Semaine terminée (5/5)";
    }
    
    // Lundi=1, Mardi=2, Mercredi=3, Jeudi=4, Vendredi=5
    const workday = dayOfWeek;
    return `Jour ${workday} sur 5`;
  };

  const { start, end, weekNumber } = getCurrentWeek();

  return (
    <div className="week-period-display">
      <div className="period-header">
        <h2>Période actuelle</h2>
        <div className="week-badge">
          <span className="week-label">Semaine</span>
          <span className="week-number">{weekNumber}</span>
        </div>
      </div>
      
      <div className="period-content">
        <div className="date-range">
          <div className="date-item start-date">
            <span className="date-label">Du</span>
            <span className="date-value">{formatDate(start)}</span>
          </div>
          
          <div className="date-separator">
            <div className="separator-line"></div>
            <div className="separator-dot"></div>
          </div>
          
          <div className="date-item end-date">
            <span className="date-label">Au</span>
            <span className="date-value">{formatDate(end)}</span>
          </div>
        </div>
        
        <div className="month-year">
          {getCurrentMonthYear()}
        </div>
      </div>
      
      <div className="period-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${getWorkdayProgress()}%` 
            }}
          ></div>
        </div>
        <div className="progress-label">
          {getWorkdayLabel()}
        </div>
      </div>
    </div>
  );
}; 