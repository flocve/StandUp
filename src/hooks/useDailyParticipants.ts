import { useState, useEffect } from 'react';
import { DailyParticipant } from '../domain/participant/entities';

export const useDailyParticipants = (
  allParticipants?: DailyParticipant[]
) => {
  const [lastSpeaker, setLastSpeaker] = useState<DailyParticipant | null>(null);

  useEffect(() => {
    if (!allParticipants) return;
    
    const spokenParticipants = allParticipants
      .filter(p => p.hasSpoken())
      .sort((a, b) => {
        const dateA = a.getLastParticipation()?.getTime() || 0;
        const dateB = b.getLastParticipation()?.getTime() || 0;
        return dateB - dateA; // Most recent first
      });
    
    setLastSpeaker(spokenParticipants[0] || null);
  }, [allParticipants]);

  return {
    lastSpeaker
  };
}; 