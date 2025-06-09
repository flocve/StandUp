import React from 'react';
import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { getParticipantPhotoUrlWithTheme, generateFallbackAnimalPhoto } from '../../../utils/animalPhotos';
import { useTheme } from '../../../contexts/ThemeContext';
import './styles.css';

interface ParticipantCardProps {
  participant: Participant | DailyParticipant;
  isSelected: boolean;
  isAnimating: boolean;
  isWinner?: boolean;
  isFadingOut?: boolean;
  showPityInfo?: boolean;
  allParticipants?: (Participant | DailyParticipant)[];
  isWaitingTurn?: boolean;
  isCurrentAnimator?: boolean;
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
    const divider = Math.max(1, p.getChancePercentage() || 1);
    return Math.max(1, Math.floor(100 / divider));
  });
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const currentDivider = Math.max(1, currentParticipant.getChancePercentage() || 1);
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

// Fonction pour obtenir une couleur cohérente basée sur l'ID du participant
const getConsistentColor = (participantId: string): string => {
  // Utiliser l'ID pour générer un index cohérent
  const hash = participantId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % CHANCE_COLORS.length;
  return CHANCE_COLORS[colorIndex];
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
  isWinner = false,
  isFadingOut = false,
  showPityInfo = false,
  allParticipants = [],
  isWaitingTurn = false,
  isCurrentAnimator = false
}) => {
  const { theme } = useTheme();
  
  // Calcul de la couleur de la carte basée sur les chances
  const chancePercentage = 'getChancePercentage' in participant ? participant.getChancePercentage() : 1;
  
  // Détermine si ce participant a les plus hautes chances
  const isTopChance = showPityInfo && allParticipants.length > 0 && 
    chancePercentage === Math.max(...allParticipants.map(p => 
      'getChancePercentage' in p ? p.getChancePercentage() : 1
    ));

  // Couleur basée sur les chances pour les participants hebdomadaires
  const getCardColor = () => {
    if (!showPityInfo) {
      return '#3B82F6'; // Bleu par défaut pour daily
    }
    
    if (chancePercentage >= 3) return '#EF4444'; // Rouge pour hautes chances
    if (chancePercentage >= 2) return '#F59E0B'; // Orange pour chances moyennes
    return '#3B82F6'; // Bleu pour chances normales
  };

  const cardColor = getCardColor();
  
  // Conversion en RGB pour les propriétés CSS
  const rgbColor = hexToRgb(cardColor);

  return (
    <div
      className={`card ${
        isSelected ? 'selected' : isAnimating ? 'not-selected' : ''
      } ${isTopChance ? 'top-chance' : ''} ${isWinner ? 'winner' : ''} ${isFadingOut ? 'fading-out' : ''} ${showPityInfo ? 'weekly-mode' : 'daily-mode'} ${isWaitingTurn ? 'waiting-turn' : ''} ${isCurrentAnimator ? 'current-animator' : ''}`}
      style={{
        '--card-color': cardColor,
        '--card-color-rgb': `${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}`
      } as React.CSSProperties}
    >
      <div className="card-content">
        {/* Étoile pour l'animateur courant */}
        {isCurrentAnimator && (
          <div className="animator-star">
            ⭐
          </div>
        )}
        
        <div className="card-avatar">
          {(() => {
            const photoUrl = getParticipantPhotoUrlWithTheme(
              participant.name.value, 
              participant.getPhotoUrl(),
              theme
            );
            return (
              <img 
                src={photoUrl} 
                alt={participant.name.value}
                className="avatar-image"
                onError={(e) => {
                  // Premier fallback: essayer un avatar DiceBear mignon
                  const target = e.target as HTMLImageElement;
                  const fallbackUrl = generateFallbackAnimalPhoto(participant.name.value);
                  if (target.src !== fallbackUrl) {
                    target.src = fallbackUrl;
                  } else {
                    // Dernier fallback: afficher l'initiale
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = participant.name.value.charAt(0);
                    }
                  }
                }}
              />
            );
          })()}
        </div>
        
        {/* Nom et compteur sur la même ligne */}
        <div className="card-info">
          <h3 className="card-name">{participant.name.value}</h3>
          
          {/* Compteur de chances pour les participants hebdomadaires */}
          {showPityInfo && 'getChancePercentage' in participant && (
            <div className="pity-counter">
              <span className="pity-star">⭐</span>
              <span className="pity-count">{participant.getChancePercentage()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 