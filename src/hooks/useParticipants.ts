import { useState, useEffect } from 'react';
import { Participant, DailyParticipant } from '../domain/participant/entities';
import type { SelectionType } from '../domain/selection/service';

export const useParticipants = (
  initialParticipants: (Participant | DailyParticipant)[],
  type: SelectionType,
  onUpdateChancePercentage?: (participantId: string, newValue: number) => void,
  useExtendedAnimation = false
) => {
  const [participants, setParticipants] = useState(initialParticipants);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | DailyParticipant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isWinnerRevealed, setIsWinnerRevealed] = useState(false); // Pour l'animation finale
  const [isCurrentSelected, setIsCurrentSelected] = useState(false); // Pour l'état stable final
  const [fadingOutParticipants, setFadingOutParticipants] = useState<Set<string>>(new Set()); // Pour le fade-out

  useEffect(() => {
    setParticipants(initialParticipants);
    setSelectedParticipant(null);
    setIsWinnerRevealed(false);
    setIsCurrentSelected(false);
    setFadingOutParticipants(new Set());
  }, [initialParticipants, type]);

  const handleSelection = (onSelect: (winner: Participant | DailyParticipant) => void, predeterminedWinner?: Participant | DailyParticipant) => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);
    let currentIndex = 0;
    
    if (useExtendedAnimation) {
      // Animation longue et impressionnante pour les animateurs - ordre aléatoire
      const interval = setInterval(() => {
        // Choisir un index aléatoire
        const randomIndex = Math.floor(Math.random() * participants.length);
        setSelectedParticipant(participants[randomIndex]);
      }, 60); // Vitesse encore plus fluide pour plus d'immersion

      // Phase rapide étendue : 5 secondes au lieu de 3
      setTimeout(() => {
        clearInterval(interval);
        
        // Phase de ralentissement progressif avec ordre aléatoire - plus d'étapes
        let delays = [120, 180, 280, 420, 600, 850, 1200]; // Plus d'étapes pour un ralentissement plus dramatique
        let delayIndex = 0;
        
        const slowDown = () => {
          if (delayIndex < delays.length) {
            // Index aléatoire pour chaque étape du ralentissement
            const randomIndex = Math.floor(Math.random() * participants.length);
            setSelectedParticipant(participants[randomIndex]);
            delayIndex++;
            setTimeout(slowDown, delays[delayIndex - 1]);
          } else {
            // Révélation finale avec animation étendue
            const winner = predeterminedWinner || participants[Math.floor(Math.random() * participants.length)];
            setSelectedParticipant(winner);
            setIsSpinning(false);
            setIsWinnerRevealed(true); // Déclenche l'animation finale
            
            if (type === 'daily') {
              setParticipants(prevParticipants => 
                prevParticipants.filter(p => p.id.value !== winner.id.value)
              );
            }
            
            // Retarder l'appel onSelect pour profiter de l'animation finale
            setTimeout(() => {
              onSelect(winner);
            }, 2500); // Plus long pour voir l'animation finale

            setTimeout(() => {
              // Pour le Daily Stand-up, on laisse le parent gérer la suppression via onSelect
              // On fait juste le fade-out visuel mais on ne modifie pas la liste locale
              if (type === 'daily') {
                setFadingOutParticipants(new Set([winner.id.value]));
                
                // Nettoyer le fade-out après l'animation, mais sans supprimer le participant
                setTimeout(() => {
                  setFadingOutParticipants(new Set());
                }, 800); // Durée du fade-out
              }
              // On garde le participant sélectionné visible mais on arrête juste l'animation winner-revealed
              setIsWinnerRevealed(false);
              setIsCurrentSelected(true); // Passer à l'état stable final pour Daily aussi
              // Ne pas remettre selectedParticipant à null pour qu'il reste visible 
              // setSelectedParticipant(null); // ← Commenté pour garder le participant visible
            }, 3000); // Animation finale encore plus longue pour l'impression
          }
        };
        
        slowDown();
      }, 5000); // Phase rapide allongée à 5 secondes
    } else {
      // Animation Daily Stand-up - maintenant aussi en ordre aléatoire !
      const interval = setInterval(() => {
        // Ordre aléatoire pour le Daily Stand-up aussi
        const randomIndex = Math.floor(Math.random() * participants.length);
        setSelectedParticipant(participants[randomIndex]);
      }, 100);

      const spinDuration = Math.random() * 2000;
      setTimeout(() => {
        clearInterval(interval);
        
        // Phase de ralentissement court pour le Daily
        let delays = [200, 350]; // Ralentissement court
        let delayIndex = 0;
        
        const slowDown = () => {
          if (delayIndex < delays.length) {
            const randomIndex = Math.floor(Math.random() * participants.length);
            setSelectedParticipant(participants[randomIndex]);
            delayIndex++;
            setTimeout(slowDown, delays[delayIndex - 1]);
          } else {
            // Révélation finale avec animation
            const winner = predeterminedWinner || participants[Math.floor(Math.random() * participants.length)];
            setSelectedParticipant(winner);
            setIsSpinning(false);
            setIsWinnerRevealed(true); // Déclenche l'animation finale
            
            // Retarder l'appel onSelect jusqu'à la fin de l'animation
            setTimeout(() => {
              onSelect(winner);
            }, 1300); // Appeler onSelect juste avant la fin de l'animation (Daily plus court)

            setTimeout(() => {
              // Pour le Daily Stand-up, on laisse le parent gérer la suppression via onSelect
              // On fait juste le fade-out visuel mais on ne modifie pas la liste locale
              if (type === 'daily') {
                setFadingOutParticipants(new Set([winner.id.value]));
                
                // Nettoyer le fade-out après l'animation, mais sans supprimer le participant
                setTimeout(() => {
                  setFadingOutParticipants(new Set());
                }, 800); // Durée du fade-out
              }
              // On garde le participant sélectionné visible mais on arrête juste l'animation winner-revealed
              setIsWinnerRevealed(false);
              setIsCurrentSelected(true); // Passer à l'état stable final pour Daily aussi
              // Ne pas remettre selectedParticipant à null pour qu'il reste visible 
              // setSelectedParticipant(null); // ← Commenté pour garder le participant visible
            }, 1500); // Animation finale pour Daily aussi
          }
        };
        
        slowDown();
      }, spinDuration);
    }
  };

  const updateChancePercentage = (participantId: string, newValue: number) => {
    if (onUpdateChancePercentage) {
      onUpdateChancePercentage(participantId, newValue);
    }
  };

  return {
    participants,
    selectedParticipant,
    isSpinning,
    isWinnerRevealed,
    isCurrentSelected,
    fadingOutParticipants,
    handleSelection,
    updateChancePercentage
  };
}; 