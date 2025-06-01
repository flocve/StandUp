import { useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { DATABASE_CONFIG } from '../../config/database';

interface UseRealtimeSyncProps {
  onWeeklyParticipantsChange?: () => void;
  onDailyParticipantsChange?: () => void;
  onAnimatorHistoryChange?: () => void;
  enabled?: boolean;
}

export const useRealtimeSync = ({
  onWeeklyParticipantsChange,
  onDailyParticipantsChange,
  onAnimatorHistoryChange,
  enabled = true
}: UseRealtimeSyncProps) => {
  
  const handleWeeklyChange = useCallback((payload: any) => {
    console.log('🔄 Changement participants hebdomadaires:', payload);
    onWeeklyParticipantsChange?.();
  }, [onWeeklyParticipantsChange]);

  const handleDailyChange = useCallback((payload: any) => {
    console.log('🔄 Changement participants quotidiens:', payload);
    onDailyParticipantsChange?.();
  }, [onDailyParticipantsChange]);

  const handleHistoryChange = useCallback((payload: any) => {
    console.log('🔄 Changement historique animateurs:', payload);
    onAnimatorHistoryChange?.();
  }, [onAnimatorHistoryChange]);

  useEffect(() => {
    // N'activer que si la synchronisation temps réel est activée
    if (!DATABASE_CONFIG.enableRealTimeSync || !enabled) {
      return;
    }

    console.log('🌐 Activation de la synchronisation temps réel Supabase');

    // Channel pour les participants hebdomadaires
    const weeklyChannel = supabase
      .channel('weekly_participants_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'weekly_participants' },
        handleWeeklyChange
      )
      .subscribe();

    // Channel pour les participants quotidiens
    const dailyChannel = supabase
      .channel('daily_participants_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'daily_participants' },
        handleDailyChange
      )
      .subscribe();

    // Channel pour l'historique des animateurs
    const historyChannel = supabase
      .channel('animator_history_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'animator_history' },
        handleHistoryChange
      )
      .subscribe();

    // Nettoyage lors du démontage
    return () => {
      console.log('🔌 Déconnexion de la synchronisation temps réel');
      weeklyChannel.unsubscribe();
      dailyChannel.unsubscribe();
      historyChannel.unsubscribe();
    };
  }, [enabled, handleWeeklyChange, handleDailyChange, handleHistoryChange]);

  // Fonction pour forcer la synchronisation
  const forceSync = useCallback(() => {
    console.log('🔄 Force sync demandée');
    onWeeklyParticipantsChange?.();
    onDailyParticipantsChange?.();
    onAnimatorHistoryChange?.();
  }, [onWeeklyParticipantsChange, onDailyParticipantsChange, onAnimatorHistoryChange]);

  return {
    isRealtimeEnabled: DATABASE_CONFIG.enableRealTimeSync && enabled,
    forceSync
  };
}; 