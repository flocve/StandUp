import React from 'react';
import { DailyParticipant } from '../../../domain/participant/entities';
import { ParticipantCard } from '../ParticipantCard';
import { useParticipants } from '../../../hooks/useParticipants';
import { useDailyParticipants } from '../../../hooks/useDailyParticipants';
import '../SelectionWheel/styles.css';

interface DailySelectionProps {
  participants: DailyParticipant[];
  onSelect: (winner: DailyParticipant) => void;
  allParticipants?: DailyParticipant[];
}

export const DailySelection: React.FC<DailySelectionProps> = ({
  participants,
  onSelect,
  allParticipants
}) => {
  const {
    participants: currentParticipants,
    selectedParticipant,
    isSpinning,
    handleSelection
  } = useParticipants(participants, 'daily');

  const { lastSpeaker } = useDailyParticipants(allParticipants);

  const currentSpeaker = selectedParticipant instanceof DailyParticipant && selectedParticipant.hasSpoken()
    ? selectedParticipant
    : lastSpeaker;

  // Fonction qui fait tout le processus de sélection
  const handleDailySelection = async () => {
    if (isSpinning) return;

    handleSelection(async (winner) => {
      // L'animation est finie, maintenant appeler onSelect
      onSelect(winner as DailyParticipant);
    });
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

      {currentSpeaker && (
        <div className="current-speaker">
          <div className="current-speaker-label">
            À TOI DE PARLER
          </div>
          <div className="name-update">
            {currentSpeaker.name.value}
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
            showPityInfo={false}
            allParticipants={currentParticipants}
          />
        ))}
      </div>
    </div>
  );
}; 