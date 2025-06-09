import React from 'react';
import { ParticipantCard } from '../ParticipantCard';
import { AnimatorHistory } from '../AnimatorHistory';
import { ChancePercentageEditor } from '../ChancePercentageEditor';
import { useParticipants } from '../../../hooks/useParticipants';
import { useAnimators } from '../../../hooks/useAnimators';
import { useTheme } from '../../../contexts/ThemeContext';
import { Participant } from '../../../domain/participant/entities';
import { getParticipantPhotoUrlWithTheme, generateFallbackAnimalPhoto } from '../../../utils/animalPhotos';
import type { WeeklySelectionUseCases } from '../../../application/weekly/useCases';
import './styles.css';

interface AnimatorSelectionProps {
  participants: Participant[];
  onSelect: (winner: Participant) => void;
  onUpdateChancePercentage: (participantId: string, newValue: number) => void;
  repository: any;
  weeklyUseCases: WeeklySelectionUseCases;
}

export const AnimatorSelection: React.FC<AnimatorSelectionProps> = ({
  participants,
  onSelect,
  onUpdateChancePercentage,
  repository,
  weeklyUseCases
}) => {
  const { theme } = useTheme();
  const {
    participants: currentParticipants,
    selectedParticipant,
    isSpinning,
    isWinnerRevealed,
    isCurrentSelected,
    fadingOutParticipants,
    handleSelection,
    updateChancePercentage
  } = useParticipants(participants, 'weekly', onUpdateChancePercentage, true);

  const {
    animatorHistory,
    currentAnimator,
    addAnimator
  } = useAnimators(participants, repository);

  const handleAnimatorSelection = async () => {
    if (isSpinning) return;

    // Protection supplémentaire : désactiver immédiatement pour éviter les clics multiples
    // Cette protection sera maintenue par l'état isSpinning du hook useParticipants
    
    // Faire la vraie sélection avec les diviseurs
    const realWinner = await weeklyUseCases.selectWeeklyAnimator();
    
    // Utiliser le vrai gagnant pour l'animation
    // L'animation gère maintenant elle-même le timing des appels
    handleSelection(async (winner) => {
      // L'animation est terminée, maintenant on peut mettre à jour l'historique
      await addAnimator(winner as Participant);
      onSelect(winner as Participant);
    }, realWinner);
  };

  return (
    <div className="animator-selection">
      <div className="selection-content">
        <div className="selection-controls">
          <button
            onClick={handleAnimatorSelection}
            disabled={isSpinning}
            className={`selection-button ${isSpinning ? 'selecting' : ''}`}
          >
            <div className="button-content">
              {isSpinning ? 'Sélection en cours...' : 'Sélectionner l\'animateur'}
            </div>
          </button>
        </div>

        {/* Bloc animateur actuel - toujours affiché */}
        <div className={`current-speaker ${
          isSpinning ? 'selecting' : 
          isWinnerRevealed ? 'winner-revealed' : 
          isCurrentSelected ? 'current-animator' :
          selectedParticipant ? 'current-animator' : ''
        }`}>
          <div className="current-speaker-label">
            {isSpinning ? 'SÉLECTION EN COURS...' : isWinnerRevealed ? '🎉 FÉLICITATIONS ! 🎉' : 'ANIMATEUR ACTUEL'}
            {isSpinning && <span className="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>}
          </div>
          
          {/* Photo du participant */}
          <div className="current-speaker-avatar">
            {(selectedParticipant || currentAnimator) && (
              <img 
                src={getParticipantPhotoUrlWithTheme(
                  (isSpinning || isWinnerRevealed ? selectedParticipant : selectedParticipant || currentAnimator)?.name.value || '',
                  (isSpinning || isWinnerRevealed ? selectedParticipant : selectedParticipant || currentAnimator)?.getPhotoUrl(),
                  theme
                )}
                alt={(isSpinning || isWinnerRevealed ? selectedParticipant : selectedParticipant || currentAnimator)?.name.value}
                className="current-speaker-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallbackUrl = generateFallbackAnimalPhoto((isSpinning || isWinnerRevealed ? selectedParticipant : selectedParticipant || currentAnimator)?.name.value || '');
                  if (target.src !== fallbackUrl) {
                    target.src = fallbackUrl;
                  } else {
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = (isSpinning || isWinnerRevealed ? selectedParticipant : selectedParticipant || currentAnimator)?.name.value.charAt(0) || '';
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                      parent.style.fontSize = '3rem';
                      parent.style.fontWeight = '700';
                      parent.style.color = 'white';
                    }
                  }
                }}
              />
            )}
          </div>
          
          <div className="name-update">
            {isSpinning ? (
              selectedParticipant ? selectedParticipant.name.value : '...'
            ) : (
              selectedParticipant ? selectedParticipant.name.value : 
              currentAnimator ? currentAnimator.name.value : 'Aucun animateur sélectionné'
            )}
          </div>
          {isSpinning && (
            <div className="selection-effects">
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
              <div className="pulse-ring delay-2"></div>
            </div>
          )}
        </div>

        <div className="participants-grid">
          {currentParticipants.map((participant, index) => (
            <ParticipantCard
              key={`${participant.id.value}-${index}`}
              participant={participant}
              isSelected={selectedParticipant?.id.value === participant.id.value}
              isAnimating={isSpinning}
              isWinner={isWinnerRevealed && selectedParticipant?.id.value === participant.id.value}
              isFadingOut={false}
              showPityInfo={true}
              allParticipants={participants}
              isWaitingTurn={isSpinning && selectedParticipant?.id.value !== participant.id.value}
            />
          ))}
        </div>

        {participants.length > 0 && typeof (participants[0] as any)?.getChanceDivisor === 'function' && (
          <ChancePercentageEditor
            participants={participants}
            onUpdateChancePercentage={updateChancePercentage}
          />
        )}
      </div>
    </div>
  );
}; 