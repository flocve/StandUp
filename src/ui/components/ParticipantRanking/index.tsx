import React from 'react';
import { DailyParticipant } from '../../../domain/participant/entities';
import './styles.css';

interface ParticipantRankingProps {
  participants: DailyParticipant[];
  onReset: () => void;
}

export const ParticipantRanking: React.FC<ParticipantRankingProps> = ({ 
  participants,
  onReset
}) => {
  // Trier les participants : d'abord ceux qui ont parlé (par ordre de participation), puis ceux qui n'ont pas parlé
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.hasSpoken() && !b.hasSpoken()) return -1;
    if (!a.hasSpoken() && b.hasSpoken()) return 1;
    if (a.hasSpoken() && b.hasSpoken()) {
      const dateA = a.getLastParticipation()?.getTime() || 0;
      const dateB = b.getLastParticipation()?.getTime() || 0;
      return dateA - dateB;
    }
    return 0;
  });

  const hasSpokenParticipants = participants.some(p => p.hasSpoken());

  return (
    <div className="ranking">
      <div className="ranking-header">
        <h2 className="ranking-title">Ordre de passage</h2>
        {hasSpokenParticipants && (
          <button 
            className="ranking-reset-button"
            onClick={onReset}
            title="Réinitialiser l'ordre de passage"
          >
            🔄
          </button>
        )}
      </div>
      <div className="ranking-list">
        {sortedParticipants
          .filter(participant => participant.hasSpoken())  // Ne garder que les participants qui ont parlé
          .map((participant, index) => (
          <div 
            key={participant.id.value}
            className="ranking-item spoken"
          >
            <div className="ranking-position">
              {index + 1}
            </div>
            <div className="ranking-name">
              {participant.name.value}
            </div>
            <div className="ranking-status">
              ✓
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 