import React from 'react';
import { ParticipantCard } from '../ParticipantCard';
import { AnimatorHistory } from '../AnimatorHistory';
import { PityCounterEditor } from '../PityCounterEditor';
import { useParticipants } from '../../../hooks/useParticipants';
import { useAnimators } from '../../../hooks/useAnimators';
import { Participant } from '../../../domain/participant/entities';
import type { WeeklySelectionUseCases } from '../../../application/weekly/useCases';
import './styles.css';

interface AnimatorSelectionProps {
  participants: Participant[];
  onSelect: (winner: Participant) => void;
  onUpdatePityCounter: (participantId: string, newValue: number) => void;
  repository: any;
  weeklyUseCases: WeeklySelectionUseCases;
  onReloadData?: () => void;
}

export const AnimatorSelection: React.FC<AnimatorSelectionProps> = ({
  participants,
  onSelect,
  onUpdatePityCounter,
  repository,
  weeklyUseCases,
  onReloadData
}) => {
  const {
    participants: currentParticipants,
    selectedParticipant,
    isSpinning,
    handleSelection,
    updatePityCounter
  } = useParticipants(participants, 'weekly', onUpdatePityCounter);

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
    handleSelection(async () => {
      // L'animation est finie, mettre à jour l'historique avec le vrai gagnant
      await addAnimator(realWinner);
      onSelect(realWinner);
      // Recharger les données après sélection
      if (onReloadData) {
        onReloadData();
      }
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
            {isSpinning ? 'Sélection...' : 'Sélectionner l\'animateur'}
          </button>
        </div>

        {currentAnimator && !selectedParticipant && (
          <div className="current-speaker">
            <div className="current-speaker-label">
              ANIMATEUR ACTUEL
            </div>
            <div className="name-update">
              {currentAnimator.name.value}
            </div>
          </div>
        )}

        <div className="participants-grid">
          {currentParticipants.map((participant, index) => (
            <ParticipantCard
              key={`${participant.id.value}-${index}`}
              participant={participant}
              isSelected={selectedParticipant?.id.value === participant.id.value}
              isAnimating={isSpinning}
              showPityInfo={true}
              allParticipants={participants}
            />
          ))}
        </div>

        <AnimatorHistory history={animatorHistory} />
        
        {participants.length > 0 && typeof (participants[0] as any)?.getChanceDivisor === 'function' && (
          <PityCounterEditor
            participants={participants}
            onUpdatePityCounter={updatePityCounter}
          />
        )}
      </div>
    </div>
  );
}; 