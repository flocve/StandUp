import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import './styles.css';

interface ChancePercentageEditorProps {
  participants: Participant[];
  onUpdateChancePercentage: (participantId: string, newValue: number) => void;
}

const calculateChancePercentage = (participants: Participant[], currentParticipant: Participant): number => {
  // Calculer le poids de chaque participant selon le système de diviseur
  const weights = participants.map(p => {
    const divider = Math.max(1, p.getChancePercentage() || 1);
    return Math.max(1, Math.floor(100 / divider));
  });
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const currentDivider = Math.max(1, currentParticipant.getChancePercentage() || 1);
  const currentWeight = Math.max(1, Math.floor(100 / currentDivider));
  
  return Math.round((currentWeight / totalWeight) * 100);
};

const getMaxChancePercentage = (participants: Participant[]): number => {
  if (participants.length === 0) return 0;
  return Math.max(...participants.map(p => calculateChancePercentage(participants, p)));
};

export const ChancePercentageEditor: React.FC<ChancePercentageEditorProps> = ({
  participants,
  onUpdateChancePercentage,
}) => {
  return (
    <div className="pity-editor">
      <h2 className="pity-editor-title">Diviseur de Chance</h2>
      <div className="pity-editor-list">
        {participants.map((participant) => {
          const chancePercentage = calculateChancePercentage(participants, participant);
          const maxChance = getMaxChancePercentage(participants);
          const isTopChance = chancePercentage === maxChance && maxChance > 0;

          return (
            <div 
              key={participant.id.value} 
              className={`pity-editor-item ${isTopChance ? 'top-chance' : ''}`}
            >
              <span className="participant-name">{participant.name.value}</span>
              
              <div className="participant-right-section">
                <span className="chance-percentage">
                  {chancePercentage}%
                </span>

                <div className="pity-controls">
                  <button
                    className="pity-button decrease"
                    onClick={() => {
                      const newValue = Math.max(1, (participant.getChancePercentage() || 1) - 1);
                      onUpdateChancePercentage(participant.id.value, newValue);
                    }}
                    disabled={(participant.getChancePercentage() || 1) <= 1}
                    title="Diminuer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={participant.getChancePercentage() || 1}
                    onChange={(e) => {
                      const newValue = Math.max(1, parseInt(e.target.value) || 1);
                      onUpdateChancePercentage(participant.id.value, newValue);
                    }}
                    className="pity-input"
                    title="Diviseur de chance"
                  />
                  <button
                    className="pity-button increase"
                    onClick={() => {
                      onUpdateChancePercentage(participant.id.value, (participant.getChancePercentage() || 1) + 1);
                    }}
                    title="Augmenter"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 