import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import './styles.css';

interface PityCounterEditorProps {
  participants: Participant[];
  onUpdatePityCounter: (participantId: string, newValue: number) => void;
}

// Palette de couleurs basée sur les chances (du froid au chaud)
const CHANCE_COLORS = [
  '#3B82F6', // bleu (faible chance)
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#D946EF', // fuchsia
  '#EC4899', // pink
  '#F97316', // orange
  '#EF4444', // rouge (haute chance)
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

const getColorByChance = (chancePercentage: number): string => {
  // Créer des seuils de pourcentage pour une répartition cohérente
  if (chancePercentage >= 25) return CHANCE_COLORS[7]; // rouge - très haute chance
  if (chancePercentage >= 20) return CHANCE_COLORS[6]; // orange - haute chance
  if (chancePercentage >= 17) return CHANCE_COLORS[5]; // pink - chance élevée
  if (chancePercentage >= 15) return CHANCE_COLORS[4]; // fuchsia - chance modérée-élevée
  if (chancePercentage >= 12) return CHANCE_COLORS[3]; // purple - chance modérée
  if (chancePercentage >= 10) return CHANCE_COLORS[2]; // violet - chance modérée-faible
  if (chancePercentage >= 7) return CHANCE_COLORS[1];  // indigo - faible chance
  return CHANCE_COLORS[0]; // bleu - très faible chance
};

// Fonction pour convertir hex en rgb
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 59, g: 130, b: 246 };
};

const getMaxChancePercentage = (participants: Participant[]): number => {
  if (participants.length === 0) return 0;
  return Math.max(...participants.map(p => calculateChancePercentage(participants, p)));
};

export const PityCounterEditor: React.FC<PityCounterEditorProps> = ({
  participants,
  onUpdatePityCounter,
}) => {
  return (
    <div className="pity-editor">
      <h2 className="pity-editor-title">Diviseur de Chance</h2>
      <div className="pity-editor-list">
        {participants.map((participant) => {
          const chancePercentage = calculateChancePercentage(participants, participant);
          const maxChance = getMaxChancePercentage(participants);
          const isTopChance = chancePercentage === maxChance && maxChance > 0;
          const cardColor = getColorByChance(chancePercentage);
          const rgbColor = hexToRgb(cardColor);

          return (
            <div 
              key={participant.id.value} 
              className={`pity-editor-item ${isTopChance ? 'top-chance' : ''}`}
              style={{
                '--card-color': cardColor,
                '--card-color-rgb': `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
              } as React.CSSProperties}
            >
              <div className="participant-info">
                <span className="participant-name">{participant.name.value}</span>
                <span className="current-pity">
                  {participant.getPityCounter() || 1}
                </span>
                <span className="chance-percentage">
                  {chancePercentage}%
                </span>
              </div>
              <div className="pity-controls">
                <button
                  className="pity-button decrease"
                  onClick={() => {
                    const newValue = Math.max(1, participant.getPityCounter() - 1);
                    onUpdatePityCounter(participant.id.value, newValue);
                  }}
                  disabled={participant.getPityCounter() <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={participant.getPityCounter() || 1}
                  onChange={(e) => {
                    const newValue = Math.max(1, parseInt(e.target.value) || 1);
                    onUpdatePityCounter(participant.id.value, newValue);
                  }}
                  className="pity-input"
                />
                <button
                  className="pity-button increase"
                  onClick={() => {
                    onUpdatePityCounter(participant.id.value, (participant.getPityCounter() || 1) + 1);
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 