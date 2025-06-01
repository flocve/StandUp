import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { DATABASE_CONFIG } from '../../config/database';

interface UseRealtimeSyncProps {
  onWeeklyParticipantsChange?: (payload?: any) => void;
  onDailyParticipantsChange?: (payload?: any) => void;
  onAnimatorHistoryChange?: (payload?: any) => void;
  enabled?: boolean;
}

export const useRealtimeSync = ({
  onWeeklyParticipantsChange,
  onDailyParticipantsChange,
  onAnimatorHistoryChange,
  enabled = true
}: UseRealtimeSyncProps) => {
  
  // Refs pour debounce
  const weeklyTimeoutRef = useRef<NodeJS.Timeout>();
  const dailyTimeoutRef = useRef<NodeJS.Timeout>();
  const historyTimeoutRef = useRef<NodeJS.Timeout>();

  const handleWeeklyChange = useCallback((payload: any) => {
    // Debounce pour éviter les mises à jour trop fréquentes
    if (weeklyTimeoutRef.current) {
      clearTimeout(weeklyTimeoutRef.current);
    }
    
    weeklyTimeoutRef.current = setTimeout(() => {
      onWeeklyParticipantsChange?.(payload);
    }, 800); // Délai plus long pour laisser le temps aux animations
  }, [onWeeklyParticipantsChange]);

  const handleDailyChange = useCallback((payload: any) => {
    if (dailyTimeoutRef.current) {
      clearTimeout(dailyTimeoutRef.current);
    }
    
    dailyTimeoutRef.current = setTimeout(() => {
      onDailyParticipantsChange?.(payload);
    }, 800);
  }, [onDailyParticipantsChange]);

  const handleHistoryChange = useCallback((payload: any) => {
    if (historyTimeoutRef.current) {
      clearTimeout(historyTimeoutRef.current);
    }
    
    historyTimeoutRef.current = setTimeout(() => {
      onAnimatorHistoryChange?.(payload);
    }, 800);
  }, [onAnimatorHistoryChange]);

  useEffect(() => {
    // N'activer que si la synchronisation temps réel est activée
    if (!DATABASE_CONFIG.enableRealTimeSync || !enabled) {
      return;
    }

    // Channel pour les participants hebdomadaires
    const weeklyChannel = supabase
      .channel('weekly-participants-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_participants' }, (payload) => {
        onWeeklyParticipantsChange?.(payload);
      })
      .subscribe();

    // Channel pour les participants quotidiens
    const dailyChannel = supabase
      .channel('daily-participants-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_participants' }, (payload) => {
        onDailyParticipantsChange?.(payload);
      })
      .subscribe();

    // Channel pour l'historique des animateurs
    const animatorChannel = supabase
      .channel('animator-history-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animator_history' }, (payload) => {
        onAnimatorHistoryChange?.(payload);
      })
      .subscribe();

    // Nettoyage lors du démontage
    return () => {
      // Nettoyer les timeouts
      if (weeklyTimeoutRef.current) {
        clearTimeout(weeklyTimeoutRef.current);
      }
      if (dailyTimeoutRef.current) {
        clearTimeout(dailyTimeoutRef.current);
      }
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      
      // Déconnecter les channels
      weeklyChannel.unsubscribe();
      dailyChannel.unsubscribe();
      animatorChannel.unsubscribe();
    };
  }, [enabled, handleWeeklyChange, handleDailyChange, handleHistoryChange]);

  // Fonction pour forcer la synchronisation
  const forceSync = useCallback(() => {
    onWeeklyParticipantsChange?.();
    onDailyParticipantsChange?.();
    onAnimatorHistoryChange?.();
  }, [onWeeklyParticipantsChange, onDailyParticipantsChange, onAnimatorHistoryChange]);

  return {
    isRealtimeEnabled: DATABASE_CONFIG.enableRealTimeSync && enabled,
    forceSync
  };
}; 