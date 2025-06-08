import { useState, useEffect, useCallback } from 'react';
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
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const history = await repository.getAnimatorHistory();
      if (history.length === 0) {
        setAnimatorHistory([]);
        if (!hasLoaded) {
          setCurrentAnimator(null);
        }
        return;
      }

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
      
      // Ne mettre à jour l'animateur courant que si on n'en a pas déjà un ou si c'est le premier chargement
      if (!hasLoaded || !currentAnimator) {
        setCurrentAnimator(historyWithParticipants[0]?.participant || null);
      } else if (historyWithParticipants.length > 0) {
        // Vérifier si l'animateur courant est toujours dans la liste des participants
        const currentStillExists = participants.find(p => p.id.value === currentAnimator.id.value);
        if (!currentStillExists) {
          // L'animateur courant n'existe plus dans la liste, prendre le plus récent de l'historique
          setCurrentAnimator(historyWithParticipants[0]?.participant || null);
        }
      }
      
      setHasLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }, [participants, repository, currentAnimator, hasLoaded]);

  useEffect(() => {
    if (participants.length > 0) {
      loadHistory();
    }
  }, [loadHistory, participants.length]);

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