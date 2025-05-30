import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import type { DailyParticipant } from '../../../domain/participant/entities';
import './styles.css';

interface ParticipantCardProps {
  participant: Participant | DailyParticipant;
  isSelected: boolean;
  isAnimating: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
];

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isSelected,
  isAnimating,
}) => {
  const cardColor = COLORS[Math.floor(Math.random() * COLORS.length)];

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
        {participant instanceof Participant && (
          <div className="pity-counter">
            <span className="pity-star">⭐</span>
            <span className="pity-count">{participant.getPityCounter()}</span>
          </div>
        )}
      </div>
    </div>
  );
}; 