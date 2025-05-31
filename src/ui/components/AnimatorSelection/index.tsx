import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import { ParticipantCard } from '../ParticipantCard';
import { PityCounterEditor } from '../PityCounterEditor';
import { AnimatorHistory } from '../AnimatorHistory';
import { useParticipants } from '../../../hooks/useParticipants';
import { useAnimators } from '../../../hooks/useAnimators';
import { Confetti } from '../Confetti';
import type { WeeklySelectionUseCases } from '../../../application/weekly/useCases';
import '../SelectionWheel/styles.css';

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

  const [showConfetti, setShowConfetti] = React.useState(false);

  // Fonction qui fait tout le processus de sélection
  const handleAnimatorSelection = async () => {
    if (isSpinning) return;

    // D'abord faire la vraie sélection avec les diviseurs
    const realWinner = await weeklyUseCases.selectWeeklyAnimator();
    
    // Ensuite faire l'animation avec le vrai gagnant
    handleSelection(async (animatedWinner) => {
      // L'animation est finie, mettre à jour l'historique avec le vrai gagnant
      await addAnimator(realWinner);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      
      // Recharger les données pour mettre à jour l'affichage
      if (onReloadData) {
        onReloadData();
      }
    }, realWinner); // Passer le vrai gagnant à l'animation
  };

  return (
    <div className="selection-content">
      {showConfetti && <Confetti />}
      
      <div className="wheel-section">
        <button
          onClick={handleAnimatorSelection}
          disabled={isSpinning}
          className="selection-button"
        >
          {isSpinning ? 'Sélection...' : 'Sélectionner'}
        </button>

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
      </div>

      <AnimatorHistory history={animatorHistory} />
      <PityCounterEditor
        participants={participants}
        onUpdatePityCounter={updatePityCounter}
      />
    </div>
  );
}; 