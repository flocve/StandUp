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

  // 1. Calculer les poids de TOUS les participants (Inverse du nombre de passages)
  const weights = participants.map(p => {
    const count = Math.max(1, p.getPassageCount()); // Utilise le nombre de passages ici
    return 1 / count;
  });

  // 2. Somme totale des poids pour la normalisation
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  // 3. Calcul du poids du participant actuel
  const currentCount = Math.max(1, currentParticipant.getPassageCount());
  const currentWeight = 1 / currentCount;
  
  // 4. Calcul du pourcentage final
  if (totalWeight === 0) return 0;
  const percentage = (currentWeight / totalWeight) * 100;
  
  // On arrondit pour l'affichage (ex: 21.9%)
  return Math.round(percentage * 10) / 10;
};

// Fonction utilitaire pour obtenir le numéro de semaine ISO
const getISOWeek = (date: Date): number => {
  const tmpDate = new Date(date.getTime());
  tmpDate.setHours(0, 0, 0, 0);
  // Jeudi de la semaine courante
  tmpDate.setDate(tmpDate.getDate() + 3 - ((tmpDate.getDay() + 6) % 7));
  const week1 = new Date(tmpDate.getFullYear(), 0, 4);
  return (
    1 + Math.round(
      ((tmpDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
};

// Retourne l'animateur de la semaine courante
const getCurrentWeekAnimator = (animatorHistory: AnimatorHistoryEntry[]): AnimatorHistoryEntry | null => {
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = now.getFullYear();
  return (
    animatorHistory.find(entry => {
      const entryWeek = getISOWeek(entry.date);
      const entryYear = entry.date.getFullYear();
      return entryWeek === currentWeek && entryYear === currentYear;
    }) || null
  );
};

// Retourne l'animateur de la semaine suivante
const getNextWeekAnimator = (animatorHistory: AnimatorHistoryEntry[]): AnimatorHistoryEntry | null => {
  const now = new Date();
  const currentWeek = getISOWeek(now);
  const currentYear = now.getFullYear();
  // Cherche la première entrée dont la semaine est > semaine courante
  return (
    animatorHistory.find(entry => {
      const entryWeek = getISOWeek(entry.date);
      const entryYear = entry.date.getFullYear();
      return (
        entryYear > currentYear ||
        (entryYear === currentYear && entryWeek > currentWeek)
      );
    }) || null
  );
};

export const useAnimators = (
  participants: Participant[],
  repository: AnimatorRepository
) => {
  const [animatorHistory, setAnimatorHistory] = useState<AnimatorHistoryEntry[]>([]);
  const [lastAnimator, setLastAnimator] = useState<Participant | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const history = await repository.getAnimatorHistory();
      if (history.length === 0) {
        setAnimatorHistory([]);
        if (!hasLoaded) {
          setLastAnimator(null);
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
      if (!hasLoaded || !lastAnimator) {
        setLastAnimator(historyWithParticipants[0]?.participant || null);
      } else if (historyWithParticipants.length > 0) {
        // Vérifier si l'animateur courant est toujours dans la liste des participants
        const currentStillExists = participants.find(p => p.id.value === lastAnimator.id.value);
        if (!currentStillExists) {
          // L'animateur courant n'existe plus dans la liste, prendre le plus récent de l'historique
          setLastAnimator(historyWithParticipants[0]?.participant || null);
        }
      }
      
      setHasLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  }, [participants, repository, lastAnimator, hasLoaded]);

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
    setLastAnimator(animator);
  };

  // Fonction pour obtenir le pourcentage de chance d'un participant
  const getParticipantChancePercentage = useCallback((participant: Participant): number => {
    return calculateChancePercentage(participants, participant);
  }, [participants]);

  return {
    animatorHistory,
    lastAnimator,
    addAnimator,
    getParticipantChancePercentage,
    getCurrentWeekAnimator: () => getCurrentWeekAnimator(animatorHistory),
    getNextWeekAnimator: () => getNextWeekAnimator(animatorHistory),
  };
}; 