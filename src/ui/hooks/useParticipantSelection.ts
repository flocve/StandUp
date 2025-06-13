import { useState, useCallback, useEffect } from 'react';
import { Participant, DailyParticipant } from '../../domain/participant/entities';
import type { SelectionType } from '../../domain/selection/service';
import type { DailySelectionUseCases } from '../../application/daily/useCases';
import type { WeeklySelectionUseCases } from '../../application/weekly/useCases';

interface UseParticipantSelectionProps {
  type: SelectionType;
  dailyUseCases?: DailySelectionUseCases;
  weeklyUseCases?: WeeklySelectionUseCases;
}

interface ParticipantSelectionState {
  participants: Participant[] | DailyParticipant[];
  allParticipants: DailyParticipant[];
  isLoading: boolean;
  error: Error | null;
}

export const useParticipantSelection = ({
  type,
  dailyUseCases,
  weeklyUseCases
}: UseParticipantSelectionProps) => {
  const [state, setState] = useState<ParticipantSelectionState>({
    participants: [],
    allParticipants: [],
    isLoading: true,
    error: null
  });

  const loadParticipants = useCallback(async (showLoading = false) => {
    if (!dailyUseCases || !weeklyUseCases) {
      if (showLoading) setState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    try {
      if (showLoading) setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (type === 'daily') {
        const available = await dailyUseCases.getAvailableParticipants();
        const all = await dailyUseCases.getParticipantsStatus();
        setState({
          participants: available,
          allParticipants: all || [],
          isLoading: false,
          error: null
        });
      } else {
        const participants = await weeklyUseCases.getAllParticipants();
        setState({
          participants,
          allParticipants: [],
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to load participants')
      }));
    }
  }, [type, dailyUseCases, weeklyUseCases]);

  const handleSelection = useCallback(async () => {
    if (!dailyUseCases || !weeklyUseCases) return;

    try {
      // Pour le Daily Stand-up, la sélection est maintenant gérée par DailySelection
      // On ne fait que recharger les données pour mettre à jour l'interface
      if (type === 'daily') {
        // Rechargement en arrière-plan sans écran de chargement
        await loadParticipants(false);
      } else {
        // Pour les animateurs, on garde la logique existante
        await weeklyUseCases.selectWeeklyAnimator();
        // Rechargement en arrière-plan sans écran de chargement
        await loadParticipants(false);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Selection failed')
      }));
    }
  }, [type, dailyUseCases, weeklyUseCases, loadParticipants]);

  const resetParticipants = useCallback(async () => {
    if (!dailyUseCases) return;

    try {
      // Montrer l'écran de chargement seulement pour les reset (opération majeure)
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (type === 'daily') {
        await dailyUseCases.resetAllParticipants();
      }

      await loadParticipants(false);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Reset failed')
      }));
    }
  }, [type, dailyUseCases, loadParticipants]);

  // Mise à jour granulaire pour un participant spécifique
  const updateSpecificParticipant = useCallback(async (participantId: string, changes: any) => {
    if (!dailyUseCases || !weeklyUseCases) return;

    try {
      setState(prev => {
        if (type === 'weekly') {
          // Mettre à jour les participants hebdomadaires
          const updatedParticipants = prev.participants.map(p => {
            if (p.id.value === participantId) {
              const participant = p as Participant;
              if (changes.chance_percentage !== undefined) {
                // Créer une nouvelle instance avec les nouvelles valeurs
                const newParticipant = new Participant(participant.id, participant.name, changes.chance_percentage);
                if (changes.passage_count !== undefined) {
                  newParticipant.setPassageCount(changes.passage_count);
                } else {
                  newParticipant.setPassageCount(participant.getPassageCount());
                }
                return newParticipant;
              }
              if (changes.passage_count !== undefined) {
                participant.setPassageCount(changes.passage_count);
              }
            }
            return p;
          });
          
          return {
            ...prev,
            participants: updatedParticipants as Participant[]
          };
        } else {
          // Mettre à jour les participants quotidiens
          const updatedParticipants = prev.participants.map(p => {
            if (p.id.value === participantId) {
              const participant = p as DailyParticipant;
              if (changes.has_spoken !== undefined && changes.has_spoken) {
                participant.markAsSpoken();
              }
              // Pour DailyParticipant, markAsSpoken() met automatiquement à jour lastParticipation
            }
            return p;
          });

          const updatedAllParticipants = prev.allParticipants.map(p => {
            if (p.id.value === participantId) {
              if (changes.has_spoken !== undefined && changes.has_spoken) {
                p.markAsSpoken();
              }
              // markAsSpoken() gère automatiquement lastParticipation
            }
            return p;
          });
          
          return {
            ...prev,
            participants: updatedParticipants as DailyParticipant[],
            allParticipants: updatedAllParticipants
          };
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du participant:', error);
    }
  }, [type, dailyUseCases, weeklyUseCases]);

  // Recharger les participants quand le type change
  useEffect(() => {
    const isFirstLoad = state.participants.length === 0;
    loadParticipants(isFirstLoad);
  }, [type, loadParticipants]);

  return {
    participants: state.participants,
    allParticipants: state.allParticipants,
    isLoading: state.isLoading,
    error: state.error,
    handleSelection,
    resetParticipants,
    loadParticipants,
    updateSpecificParticipant
  };
}; 