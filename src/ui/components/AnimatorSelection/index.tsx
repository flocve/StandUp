import React from 'react';
import { ParticipantCard } from '../ParticipantCard';
import { AnimatorHistory } from '../AnimatorHistory';
import { ChancePercentageEditor } from '../ChancePercentageEditor';
import { useParticipants } from '../../../hooks/useParticipants';
import { useAnimators } from '../../../hooks/useAnimators';
import { Participant } from '../../../domain/participant/entities';
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
  const {
    participants: currentParticipants,
    selectedParticipant,
    isSpinning,
    isWinnerRevealed,
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
            className="selection-button"
          >
            {isSpinning ? (
              <span className="button-content">
                <span className="spinner"></span>
                Sélection en cours...
              </span>
            ) : (
              'Sélectionner l\'animateur'
            )}
          </button>
        </div>

        {/* Bloc animateur actuel - toujours affiché */}
        <div className={`current-speaker ${isSpinning ? 'selecting' : ''}`}>
          <div className="current-speaker-label">
            {isSpinning ? 'SÉLECTION EN COURS...' : 'ANIMATEUR ACTUEL'}
            {isSpinning && <span className="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>}
          </div>
          <div className="name-update">
            {isSpinning ? (
              selectedParticipant ? selectedParticipant.name.value : '...'
            ) : (
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
            />
          ))}
        </div>

        <AnimatorHistory history={animatorHistory} />
        
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