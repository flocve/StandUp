import { useState, useCallback, useEffect } from 'react';
import type { Participant, DailyParticipant } from '../../domain/participant/entities';
import type { SelectionType } from '../../domain/selection/service';
import type { DailySelectionUseCases } from '../../application/daily/useCases';
import type { WeeklySelectionUseCases } from '../../application/weekly/useCases';

interface UseParticipantSelectionProps {
  type: SelectionType;
  dailyUseCases: DailySelectionUseCases;
  weeklyUseCases: WeeklySelectionUseCases;
}

interface ParticipantSelectionState {
  participants: (Participant | DailyParticipant)[];
  allParticipants: DailyParticipant[] | null;
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
    allParticipants: null,
    isLoading: true,
    error: null
  });

  const loadParticipants = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (type === 'daily') {
        const available = await dailyUseCases.getAvailableParticipants();
        const all = await dailyUseCases.getParticipantsStatus();
        setState({
          participants: available,
          allParticipants: all,
          isLoading: false,
          error: null
        });
      } else {
        const participants = await weeklyUseCases.getAllParticipants();
        setState({
          participants,
          allParticipants: null,
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
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (type === 'daily') {
        await dailyUseCases.selectNextParticipant();
      } else {
        await weeklyUseCases.selectWeeklyAnimator();
      }

      await loadParticipants();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Selection failed')
      }));
    }
  }, [type, dailyUseCases, weeklyUseCases, loadParticipants]);

  const resetParticipants = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (type === 'daily') {
        await dailyUseCases.resetAllParticipants();
      }

      await loadParticipants();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Reset failed')
      }));
    }
  }, [type, dailyUseCases, loadParticipants]);

  // Recharger les participants quand le type change
  useEffect(() => {
    loadParticipants();
  }, [type, loadParticipants]);

  return {
    participants: state.participants,
    allParticipants: state.allParticipants,
    isLoading: state.isLoading,
    error: state.error,
    handleSelection,
    resetParticipants,
    loadParticipants
  };
}; 