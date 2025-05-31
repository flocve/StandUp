import { useState, useEffect } from 'react';
import { Participant, DailyParticipant } from '../domain/participant/entities';
import type { SelectionType } from '../domain/selection/service';

export const useParticipants = (
  initialParticipants: (Participant | DailyParticipant)[],
  type: SelectionType,
  onUpdatePityCounter?: (participantId: string, newValue: number) => void
) => {
  const [participants, setParticipants] = useState(initialParticipants);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | DailyParticipant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    setParticipants(initialParticipants);
    setSelectedParticipant(null);
  }, [initialParticipants, type]);

  const handleSelection = (onSelect: (winner: Participant | DailyParticipant) => void, predeterminedWinner?: Participant | DailyParticipant) => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);
    let currentIndex = 0;
    const interval = setInterval(() => {
      setSelectedParticipant(participants[currentIndex]);
      currentIndex = (currentIndex + 1) % participants.length;
    }, 100);

    const spinDuration = Math.random() * 2000 + 2000;
    setTimeout(() => {
      clearInterval(interval);
      const winner = predeterminedWinner || participants[Math.floor(Math.random() * participants.length)];
      setSelectedParticipant(winner);
      setIsSpinning(false);
      
      // Mettre à jour la liste des participants en retirant le gagnant
      if (type === 'daily') {
        setParticipants(prevParticipants => 
          prevParticipants.filter(p => p.id.value !== winner.id.value)
        );
      }
      
      onSelect(winner);

      setTimeout(() => {
        setSelectedParticipant(null);
      }, 200);
    }, spinDuration);
  };

  const updatePityCounter = (participantId: string, newValue: number) => {
    if (onUpdatePityCounter) {
      onUpdatePityCounter(participantId, newValue);
    }
  };

  return {
    participants,
    selectedParticipant,
    isSpinning,
    handleSelection,
    updatePityCounter
  };
}; 