import React from 'react';
import { DailyParticipant, Participant } from '../../../domain/participant/entities';
import { ParticipantCard } from '../ParticipantCard';
import { useParticipants } from '../../../hooks/useParticipants';
import { useDailyParticipants } from '../../../hooks/useDailyParticipants';
import { getParticipantPhotoUrlWithTheme, generateFallbackAnimalPhoto } from '../../../utils/animalPhotos';
import type { DailySelectionUseCases } from '../../../application/daily/useCases';
import './styles.css';
import { useTheme } from '../../../contexts/ThemeContext';

interface DailySelectionProps {
  participants: DailyParticipant[];
  onSelect: (winner: DailyParticipant) => void;
  allParticipants?: DailyParticipant[];
  dailyUseCases?: DailySelectionUseCases;
  currentAnimator?: Participant | null;
  onTerminate?: () => void;
}

export const DailySelection: React.FC<DailySelectionProps> = ({
  participants,
  onSelect,
  allParticipants,
  dailyUseCases,
  currentAnimator,
  onTerminate
}) => {
  const { theme } = useTheme();
  const {
    participants: currentParticipants,
    selectedParticipant,
    isSpinning,
    isWinnerRevealed,
    isCurrentSelected,
    fadingOutParticipants,
    handleSelection
  } = useParticipants(participants, 'daily', undefined, false);

  const { lastSpeaker } = useDailyParticipants(allParticipants);

  const currentSpeaker = selectedParticipant instanceof DailyParticipant && selectedParticipant.hasSpoken()
    ? selectedParticipant
    : lastSpeaker;

  // Fonction qui fait tout le processus de sélection
  const handleDailySelection = async () => {
    if (isSpinning || !dailyUseCases) return;

    try {
      // Obtenir la liste des participants disponibles
      const availableParticipants = await dailyUseCases.getAvailableParticipants();
      
      if (availableParticipants.length === 0) {
        console.error('Aucun participant disponible');
        return;
      }

      // Faire la sélection locale immédiatement (calcul rapide)
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      const selectedWinner = availableParticipants[randomIndex];
      
      // Démarrer l'animation immédiatement avec le gagnant sélectionné
      handleSelection(async (winner) => {
        // L'animation est terminée, appeler onSelect pour mettre à jour l'UI
        onSelect(winner as DailyParticipant);
      }, selectedWinner);

      // Pendant que l'animation se déroule, mettre à jour la base de données en arrière-plan
      selectedWinner.markAsSpoken();
      await dailyUseCases.updateParticipant(selectedWinner);
      
    } catch (error) {
      console.error('Erreur lors de la sélection:', error);
    }
  };

  // Fonction pour la sélection directe d'un participant
  const handleDirectSelect = async (participant: DailyParticipant) => {
    if (isSpinning || !dailyUseCases) return;

    try {
      // Vérifier que le participant est disponible
      const availableParticipants = await dailyUseCases.getAvailableParticipants();
      const isAvailable = availableParticipants.some(p => p.id.value === participant.id.value);
      
      if (!isAvailable) {
        console.error('Ce participant n\'est pas disponible pour la sélection');
        return;
      }

      // Sélection directe sans animation - appeler directement onSelect
      participant.markAsSpoken();
      await dailyUseCases.updateParticipant(participant);
      onSelect(participant);
      
    } catch (error) {
      console.error('Erreur lors de la sélection directe:', error);
    }
  };

  // Vérifier s'il faut afficher le bouton Terminer
  const shouldShowTerminate = participants.length === 0 && currentSpeaker && onTerminate;

  return (
    <div className="wheel-section">
      {!shouldShowTerminate ? (
        <button
          onClick={handleDailySelection}
          disabled={isSpinning}
          className={`selection-button ${isSpinning ? 'selecting' : ''}`}
        >
          <div className="button-content">
            {isSpinning ? 'Sélection en cours...' : 'Sélectionner'}
          </div>
        </button>
      ) : (
        <button
          onClick={onTerminate}
          className="selection-button terminate-button"
        >
          <div className="button-content">
            Terminer le Stand-up
          </div>
        </button>
      )}

      <div className={`current-speaker ${
        isSpinning ? 'selecting' : 
        isWinnerRevealed ? 'winner-revealed' : 
        isCurrentSelected ? 'current-speaker-selected' :
        selectedParticipant ? 'current-speaker-selected' : ''
      }`}>
        <div className="current-speaker-label">
          {isSpinning ? 'SÉLECTION EN COURS...' : isWinnerRevealed ? '🎉 À TOI DE PARLER ! 🎉' : 'À TOI DE PARLER'}
          {isSpinning && <span className="dots">
            <span>.</span><span>.</span><span>.</span>
          </span>}
        </div>
        
        {/* Photo du participant */}
        {(selectedParticipant || currentSpeaker) && (
          <div className="current-speaker-avatar">
            <img 
              src={getParticipantPhotoUrlWithTheme(
                (isSpinning || isWinnerRevealed ? selectedParticipant : currentSpeaker)?.name.value || '',
                (isSpinning || isWinnerRevealed ? selectedParticipant : currentSpeaker)?.getPhotoUrl(),
                theme
              )}
              alt={(isSpinning || isWinnerRevealed ? selectedParticipant : currentSpeaker)?.name.value}
              className="current-speaker-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbackUrl = generateFallbackAnimalPhoto((isSpinning || isWinnerRevealed ? selectedParticipant : currentSpeaker)?.name.value || '');
                if (target.src !== fallbackUrl) {
                  target.src = fallbackUrl;
                } else {
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = (isSpinning || isWinnerRevealed ? selectedParticipant : currentSpeaker)?.name.value.charAt(0) || '';
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                    parent.style.fontSize = '3rem';
                    parent.style.fontWeight = '700';
                    parent.style.color = 'white';
                  }
                }
              }}
            />
          </div>
        )}
        
        <div className="name-update">
          {isSpinning ? (
            selectedParticipant ? selectedParticipant.name.value : '...'
          ) : (
            (selectedParticipant || currentSpeaker) ? (selectedParticipant || currentSpeaker)?.name.value : (
              <div className="invitation-message">
                🎯 Qui va commencer le stand-up d'aujourd'hui ?<br />
                <span className="invitation-subtitle">Appuyez sur "Sélectionner" pour découvrir !</span>
              </div>
            )
          )}
        </div>
      </div>

      <div className="participants-grid">
        {currentParticipants.map((participant, index) => (
          <ParticipantCard
            key={`${participant.id.value}-${index}`}
            participant={participant}
            isSelected={selectedParticipant?.id.value === participant.id.value}
            isAnimating={isSpinning}
            isWinner={isWinnerRevealed && selectedParticipant?.id.value === participant.id.value}
            isFadingOut={fadingOutParticipants.has(participant.id.value)}
            showPityInfo={false}
            allParticipants={currentParticipants}
            isWaitingTurn={isSpinning && selectedParticipant?.id.value !== participant.id.value}
            isCurrentAnimator={currentAnimator ? participant.name.value === currentAnimator.name.value : false}
            onDirectSelect={(p) => handleDirectSelect(p as DailyParticipant)}
            showDirectSelectButton={!isSpinning && !selectedParticipant}
          />
        ))}
      </div>
    </div>
  );
}; 