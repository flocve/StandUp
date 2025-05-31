import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import './styles.css';

interface AnimatorRankingProps {
  participants: Participant[];
  lastSelected?: Participant | null;
}

export const AnimatorRanking: React.FC<AnimatorRankingProps> = ({ 
  participants,
  lastSelected
}) => {
  // Récupérer l'historique des sélections du localStorage
  const getSelectionHistory = () => {
    const history = JSON.parse(localStorage.getItem('animator_history') || '[]') as string[];
    // Filtrer les doublons et garder uniquement les IDs valides
    const uniqueHistory = [...new Set(history)];
    return uniqueHistory
      .map(id => participants.find(p => p.id.value === id))
      .filter((p): p is Participant => p !== undefined);
  };

  const selectionHistory = getSelectionHistory();

  return (
    <div className="ranking-container">
      {lastSelected && (
        <div className="current-animator">
          <h2 className="current-animator-title">L'animateur est</h2>
          <div className="current-animator-name">{lastSelected.name.value}</div>
        </div>
      )}
      <div className="ranking">
        <div className="ranking-header">
          <h2 className="ranking-title">Nos derniers animateurs</h2>
        </div>
        <div className="ranking-list">
          {selectionHistory.map((participant, index) => (
            <div 
              key={`${participant.id.value}-${index}`}
              className="ranking-item"
            >
              <div className="ranking-position">
                {index + 1}
              </div>
              <div className="ranking-name">
                {participant.name.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 