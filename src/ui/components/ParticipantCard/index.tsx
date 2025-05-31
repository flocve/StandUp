import React from 'react';
import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import './styles.css';

interface ParticipantCardProps {
  participant: Participant | DailyParticipant;
  isSelected: boolean;
  isAnimating: boolean;
  showPityInfo?: boolean;
  allParticipants?: Participant[];
}

const COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
];

const calculateChancePercentage = (participants: Participant[], currentParticipant: Participant): number => {
  // Calculer le poids de chaque participant selon le système de diviseur
  const weights = participants.map(p => {
    const divider = Math.max(1, p.getPityCounter() || 1);
    return Math.max(1, Math.floor(100 / divider));
  });
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const currentDivider = Math.max(1, currentParticipant.getPityCounter() || 1);
  const currentWeight = Math.max(1, Math.floor(100 / currentDivider));
  
  return Math.round((currentWeight / totalWeight) * 100);
};

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isSelected,
  isAnimating,
  showPityInfo = false,
  allParticipants = []
}) => {
  const cardColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  const isWeeklyParticipant = participant instanceof Participant;
  
  // Calculer le pourcentage de chance basé sur le diviseur
  const chancePercentage = allParticipants.length > 0 ? 
    calculateChancePercentage(allParticipants, participant) : 0;

  return (
    <div
      className={`card ${
        isSelected ? 'selected' : isAnimating ? 'not-selected' : ''
      }`}
      style={{
        '--card-color': cardColor,
        '--card-color-rgb': '59, 130, 246'
      } as React.CSSProperties}
    >
      <div className="card-content">
        <div className="card-avatar">
          {participant.name.value.charAt(0)}
        </div>
        <h3 className="card-name">{participant.name.value}</h3>
        {isWeeklyParticipant && showPityInfo && (
          <div className="pity-stats">
            <div className="pity-counter">
              <span className="pity-star">📉</span>
              <span className="pity-count">{participant.getPityCounter() || 1}</span>
            </div>
            <div className="chance-percentage">
              {chancePercentage}% de chance
            </div>
            <div className="chance-bar-container">
              <div 
                className="chance-bar" 
                style={{
                  width: `${Math.max(5, chancePercentage)}%`,
                  backgroundColor: cardColor
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 