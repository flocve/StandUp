import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import './styles.css';

interface AnimatorHistoryProps {
  history: Array<{
    participant: Participant;
    date: Date;
  }>;
}

export const AnimatorHistory: React.FC<AnimatorHistoryProps> = ({ history }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="animator-history">
      <div className="animator-history-title">Nos derniers animateurs</div>
      <div className="animator-history-list">
        {history.map((entry, index) => (
          <div 
            key={`${entry.participant.id.value}-${index}`} 
            className="animator-history-item"
          >
            <div className="animator-history-number">{index + 1}</div>
            <div className="animator-history-content">
              <div className="animator-history-name">
                {entry.participant.name.value}
              </div>
              <div className="animator-history-date">
                {formatDate(entry.date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 