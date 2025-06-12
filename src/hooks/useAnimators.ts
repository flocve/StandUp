import { useState, useEffect, useCallback } from 'react';
import { Participant } from '../domain/participant/entities';

interface AnimatorHistoryEntry {
  participant: Participant;
  date: Date;
}

interface AnimatorRepository {
  getAnimatorHistory: () => Promise<Array<{ id: string; date: string }>>;
  addToAnimatorHistory: (participantId: string, date?: Date) => Promise<void>;
}

// Fonction pour calculer le prochain lundi
const getNextMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // Si c'est dimanche, le prochain lundi est dans 1 jour
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0); // Commencer à minuit
  
  return nextMonday;
};

// Fonction pour calculer le pourcentage de chance basé sur le diviseur
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
    const nextMonday = getNextMonday();
    await repository.addToAnimatorHistory(animator.id.value, nextMonday);
    const newHistoryEntry = {
      participant: animator,
      date: nextMonday
    };
    setAnimatorHistory(prev => [newHistoryEntry, ...prev]);
    setCurrentAnimator(animator);
  };

  // Fonction pour obtenir le pourcentage de chance d'un participant
  const getParticipantChancePercentage = useCallback((participant: Participant): number => {
    return calculateChancePercentage(participants, participant);
  }, [participants]);

  return {
    animatorHistory,
    currentAnimator,
    addAnimator,
    getParticipantChancePercentage
  };
}; 