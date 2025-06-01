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
    console.log('🔄 Changement participants hebdomadaires:', payload);
    
    // Debounce pour éviter les mises à jour trop fréquentes
    if (weeklyTimeoutRef.current) {
      clearTimeout(weeklyTimeoutRef.current);
    }
    
    weeklyTimeoutRef.current = setTimeout(() => {
      onWeeklyParticipantsChange?.(payload);
    }, 800); // Délai plus long pour laisser le temps aux animations
  }, [onWeeklyParticipantsChange]);

  const handleDailyChange = useCallback((payload: any) => {
    console.log('🔄 Changement participants quotidiens:', payload);
    
    if (dailyTimeoutRef.current) {
      clearTimeout(dailyTimeoutRef.current);
    }
    
    dailyTimeoutRef.current = setTimeout(() => {
      onDailyParticipantsChange?.(payload);
    }, 800);
  }, [onDailyParticipantsChange]);

  const handleHistoryChange = useCallback((payload: any) => {
    console.log('🔄 Changement historique animateurs:', payload);
    
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