import React from 'react';
import { DailyParticipant } from '../../../domain/participant/entities';
import './styles.css';

interface ParticipantRankingProps {
  participants: DailyParticipant[];
  onReset: () => void;
}

const ResetIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const AzureIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3L2 12l10 9 10-9-10-9z" />
    <path d="M2 12l10 9 10-9" />
    <path d="M12 3v18" />
  </svg>
);

const TaskIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);

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
    <div className="ranking-container">
      <div className="ranking">
        <div className="ranking-header">
          <h2 className="ranking-title">Ordre de passage</h2>
          {hasSpokenParticipants && (
            <button 
              className="ranking-reset-button"
              onClick={onReset}
              title="Réinitialiser l'ordre de passage"
            >
              <ResetIcon />
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
      <a 
        href="https://dev.azure.com/bazimo-app/bazimo-app/_boards/board/t/Development%20Team/Stories%20and%20Bugs"
        target="_blank"
        rel="noopener noreferrer"
        className="azure-button"
      >
        <TaskIcon />
        <span>Stories & Bugs</span>
      </a>
      <a 
        href="https://dev.azure.com/bazimo-app/bazimo-app/_dashboards/dashboard/94002b13-ea84-4455-9eb1-71bc99101095"
        target="_blank"
        rel="noopener noreferrer"
        className="azure-button"
      >
        <AzureIcon />
        <span>Azure Dashboard</span>
      </a>
    </div>
  );
}; 