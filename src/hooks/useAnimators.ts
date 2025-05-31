import { useState, useEffect } from 'react';
import { Participant } from '../domain/participant/entities';

interface AnimatorHistoryEntry {
  participant: Participant;
  date: Date;
}

interface AnimatorRepository {
  getAnimatorHistory: () => Promise<Array<{ id: string; date: string }>>;
  addToAnimatorHistory: (participantId: string) => Promise<void>;
}

export const useAnimators = (
  participants: Participant[],
  repository: AnimatorRepository
) => {
  const [animatorHistory, setAnimatorHistory] = useState<AnimatorHistoryEntry[]>([]);
  const [currentAnimator, setCurrentAnimator] = useState<Participant | null>(null);

  useEffect(() => {
    loadHistory();
  }, [participants]);

  const loadHistory = async () => {
    const history = await repository.getAnimatorHistory();
    const historyWithParticipants = history
      .map((entry) => {
        const participant = participants.find(p => p.id.value === entry.id);
        return participant ? {
          participant,
          date: new Date(entry.date)
        } : null;
      })
      .filter((entry): entry is AnimatorHistoryEntry => entry !== null);
    
    setAnimatorHistory(historyWithParticipants);
    setCurrentAnimator(historyWithParticipants[0]?.participant || null);
  };

  const addAnimator = async (animator: Participant) => {
    await repository.addToAnimatorHistory(animator.id.value);
    const newHistoryEntry = {
      participant: animator,
      date: new Date()
    };
    setAnimatorHistory(prev => [newHistoryEntry, ...prev]);
    setCurrentAnimator(animator);
  };

  return {
    animatorHistory,
    currentAnimator,
    addAnimator
  };
}; 