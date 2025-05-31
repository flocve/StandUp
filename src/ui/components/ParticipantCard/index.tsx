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

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isSelected,
  isAnimating,
  showPityInfo = false,
  allParticipants = []
}) => {
  const isWeeklyParticipant = participant instanceof Participant;
  
  // Calculer le pourcentage de chance basé sur le diviseur
  const chancePercentage = allParticipants.length > 0 ? 
    calculateChancePercentage(allParticipants, participant) : 0;

  // Vérifier si c'est un participant avec la plus haute chance
  const maxChance = getMaxChancePercentage(allParticipants);
  const isTopChance = showPityInfo && chancePercentage === maxChance && maxChance > 0;

  // Choisir la couleur basée sur le pourcentage de chance
  const cardColor = showPityInfo && allParticipants.length > 0 ? 
    getColorByChance(chancePercentage) : 
    CHANCE_COLORS[Math.floor(Math.random() * CHANCE_COLORS.length)];

  const rgbColor = hexToRgb(cardColor);

  return (
    <div
      className={`card ${
        isSelected ? 'selected' : isAnimating ? 'not-selected' : ''
      } ${isTopChance ? 'top-chance' : ''}`}
      style={{
        '--card-color': cardColor,
        '--card-color-rgb': `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
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