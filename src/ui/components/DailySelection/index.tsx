import React from 'react';
import { DailyParticipant } from '../../../domain/participant/entities';
import { ParticipantCard } from '../ParticipantCard';
import { useParticipants } from '../../../hooks/useParticipants';
import { useDailyParticipants } from '../../../hooks/useDailyParticipants';
import type { DailySelectionUseCases } from '../../../application/daily/useCases';
import '../SelectionWheel/styles.css';

interface DailySelectionProps {
  participants: DailyParticipant[];
  onSelect: (winner: DailyParticipant) => void;
  allParticipants?: DailyParticipant[];
  dailyUseCases?: DailySelectionUseCases;
}

export const DailySelection: React.FC<DailySelectionProps> = ({
  participants,
  onSelect,
  allParticipants,
  dailyUseCases
}) => {
  const {
    participants: currentParticipants,
    selectedParticipant,
    isSpinning,
    isWinnerRevealed,
    fadingOutParticipants,
    handleSelection
  } = useParticipants(participants, 'daily');

  const { lastSpeaker } = useDailyParticipants(allParticipants);

  const currentSpeaker = selectedParticipant instanceof DailyParticipant && selectedParticipant.hasSpoken()
    ? selectedParticipant
    : lastSpeaker;

  // Fonction qui fait tout le processus de sélection
  const handleDailySelection = async () => {
    if (isSpinning || !dailyUseCases) return;

    try {
      // Faire la vraie sélection avec la logique métier
      const realWinner = await dailyUseCases.selectNextParticipant();
      
      // Utiliser le vrai gagnant pour l'animation
      handleSelection(async (winner) => {
        // L'animation est terminée, appeler onSelect pour mettre à jour l'UI
        onSelect(winner as DailyParticipant);
      }, realWinner);
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
    }
  };

  return (
    <div className="wheel-section">
      <button
        onClick={handleDailySelection}
        disabled={isSpinning}
        className="selection-button"
      >
        {isSpinning ? 'Sélection...' : 'Sélectionner'}
      </button>

      <div className="current-speaker">
        <div className="current-speaker-label">
          À TOI DE PARLER
        </div>
        <div className="name-update">
          {currentSpeaker ? (
            currentSpeaker.name.value
          ) : (
            <div className="invitation-message">
              🎯 Qui va commencer le stand-up d'aujourd'hui ?<br />
              <span className="invitation-subtitle">Appuyez sur "Sélectionner" pour découvrir !</span>
            </div>
          )}
        </div>
      </div>

      <div className="participants-grid">
        {currentParticipants.map((participant, index) => (
          <ParticipantCard
            key={`${participant.id.value}-${index}`}
            participant={participant}
            isSelected={selectedParticipant?.id.value === participant.id.value}
            isAnimating={isSpinning}
            isWinner={isWinnerRevealed && selectedParticipant?.id.value === participant.id.value}
            isFadingOut={fadingOutParticipants.has(participant.id.value)}
            showPityInfo={false}
            allParticipants={currentParticipants}
          />
        ))}
      </div>
    </div>
  );
}; 