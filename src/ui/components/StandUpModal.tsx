import React, { useState, useEffect } from 'react';
import { DailyParticipant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { DailySelectionUseCases } from '../../application/daily/useCases';
import { useParticipants } from '../../hooks/useParticipants';
import { useDailyParticipants } from '../../hooks/useDailyParticipants';
import { getParticipantPhotoUrlWithTheme } from '../../utils/animalPhotos';
import './StandUpModal.css';

interface StandUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  allParticipants?: DailyParticipant[];
  onSelect: (participant: any) => void;
  onReset: () => void;
  repository: ParticipantRepository;
  dailyUseCases: DailySelectionUseCases;
  currentAnimator?: any;
  theme?: string;
}

// Fonction pour générer une couleur d'avatar basée sur le nom
const getAvatarColor = (name: string) => {
  const colors = [
    { bg: '#4f7cff', text: '#ffffff' },
    { bg: '#7c3aed', text: '#ffffff' },
    { bg: '#06b6d4', text: '#ffffff' },
    { bg: '#10b981', text: '#ffffff' },
    { bg: '#f59e0b', text: '#ffffff' },
    { bg: '#ef4444', text: '#ffffff' },
    { bg: '#8b5cf6', text: '#ffffff' },
    { bg: '#14b8a6', text: '#ffffff' },
  ];
  
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

// Fonction helper pour obtenir l'URL de photo avec support du thème
const getPhotoUrl = (participant: any, theme?: string) => {
  const participantName = String(participant?.name?.value || participant?.name || 'Participant');
  const customPhotoUrl = participant?.getPhotoUrl?.();
  return getParticipantPhotoUrlWithTheme(participantName, customPhotoUrl, theme);
};

export const StandUpModal: React.FC<StandUpModalProps> = ({
  isOpen,
  onClose,
  participants,
  allParticipants,
  onSelect,
  onReset,
  repository,
  dailyUseCases,
  currentAnimator,
  theme
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
  // Hook système de shuffle existant qui fonctionne
  const {
    participants: shuffleParticipants,
    selectedParticipant,
    isSpinning,
    isWinnerRevealed,
    isCurrentSelected,
    fadingOutParticipants,
    handleSelection
  } = useParticipants(allParticipants || [], 'daily', undefined, false);

  // Hook pour récupérer le dernier speaker
  const { lastSpeaker } = useDailyParticipants(allParticipants);

  // States pour l'overlay d'animation
  const [showShuffleOverlay, setShowShuffleOverlay] = useState(false);
  const [isShuffleOverlayClosing, setIsShuffleOverlayClosing] = useState(false);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [shuffleNames, setShuffleNames] = useState<string[]>([]);
  const [shufflePhase, setShufflePhase] = useState<'shuffling' | 'winner'>('shuffling');
  const [winnerName, setWinnerName] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Gestion de la touche Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 250); // Synchronisé avec l'animation CSS
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleParticipantSelect = async (participant: any) => {
    if (isSpinning || !dailyUseCases) return;

    try {
      // Vérifier que le participant est disponible
      const availableParticipants = await dailyUseCases.getAvailableParticipants();
      const isAvailable = availableParticipants.some(p => p.id.value === participant.id.value);
      
      if (!isAvailable) {
        console.error('Ce participant n\'est pas disponible pour la sélection');
        return;
      }

      // Sélection directe - marquer comme ayant parlé et mettre à jour
      participant.markAsSpoken();
      await dailyUseCases.updateParticipant(participant);
      onSelect(participant);
      
    } catch (error) {
      console.error('Erreur lors de la sélection directe:', error);
    }
  };

  const handleShuffleSelect = async () => {
    if (isSpinning || !dailyUseCases) return;

    try {
      // Obtenir la liste des participants disponibles
      const available = await dailyUseCases.getAvailableParticipants();
      
      if (available.length === 0) {
        console.error('Aucun participant disponible');
        return;
      }

      // Préparer les noms pour l'animation
      const names = available.map(p => String(p.name?.value || p.name || 'Participant'));
      setShuffleNames(names);
      setShowShuffleOverlay(true);
      setCurrentShuffleIndex(0);
      setShufflePhase('shuffling');
      setWinnerName('');

      console.log('🎲 Animation démarrée avec', available.length, 'participants');

      // Animation des noms qui défilent (ultra rapide)
      let currentIndex = 0;
      let delay = 20; // Encore plus rapide
      let cyclesToShow = Math.min(available.length + 3, 5); // Maximum 5 cycles
      const maxDelay = 50; // Très court
      const delayIncrement = 3; // Petits incréments

      const animateNames = () => {
        if (cyclesToShow > 0) {
          setCurrentShuffleIndex(currentIndex % names.length);
          currentIndex++;
          cyclesToShow--;
          
          // Ralentir progressivement seulement à la toute fin
          if (cyclesToShow < 3) { // Ralentissement sur les 3 derniers cycles seulement
            delay += delayIncrement;
          }
          
          setTimeout(animateNames, Math.min(delay, maxDelay));
        } else {
          // Animation terminée - NOUS faisons la vraie sélection
          console.log('🎯 Sélection du gagnant...');
          
          // VRAIE sélection avec notre algorithme
          const finalWinner = available[Math.floor(Math.random() * available.length)];
          const winnerName = String(finalWinner.name?.value || finalWinner.name || 'Gagnant');
          console.log('🏆 Gagnant sélectionné:', winnerName);
          
          // Continuer l'animation lentement pendant que le hook fait son animation
          let finalAnimationRunning = true;
          const continueAnimation = () => {
            if (finalAnimationRunning) {
              setCurrentShuffleIndex((prev) => (prev + 1) % names.length);
              setTimeout(continueAnimation, 80);
            }
          };
          continueAnimation();
          
          // Le hook fait juste l'animation avec notre gagnant prédéterminé
          handleSelection(async (hookWinner) => {
            // Arrêter l'animation finale
            finalAnimationRunning = false;
            
            // Utiliser NOTRE gagnant (pas celui du hook)
            console.log('🎭 Animation terminée, affichage de notre gagnant:', winnerName);
            
            // Passer en phase "winner" pour montrer le résultat
            setWinnerName(winnerName);
            setShufflePhase('winner');
            
            // Mettre à jour la base de données avec NOTRE gagnant
            try {
              finalWinner.markAsSpoken();
              await dailyUseCases.updateParticipant(finalWinner);
              onSelect(finalWinner);
              console.log('✅ Base de données mise à jour avec notre gagnant');
            } catch (error) {
              console.error('Erreur lors de la mise à jour:', error);
            }
            
            // Masquer l'overlay après avoir bien montré le gagnant avec transition douce
            setTimeout(() => {
              setIsShuffleOverlayClosing(true);
              setTimeout(() => {
                setShowShuffleOverlay(false);
                setIsShuffleOverlayClosing(false);
              }, 800); // Durée de l'animation de fermeture
            }, 1500);
          }, finalWinner); // Passer notre gagnant au hook
        }
      };

      // Démarrer l'animation immédiatement
      animateNames();
      
    } catch (error) {
      console.error('Erreur lors de la sélection shuffle:', error);
    }
  };

  // Calculer les participants qui ont parlé (dans l'ordre)
  const participantsWhoSpoke = allParticipants?.filter(p => 
    typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
  ) || [];

  const availableParticipants = allParticipants?.filter(p => 
    typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
  ) || [];

  // Trouver le speaker courant - soit celui sélectionné dans l'animation, soit le dernier speaker
  const currentSpeaker = selectedParticipant instanceof DailyParticipant && selectedParticipant.hasSpoken()
    ? selectedParticipant
    : lastSpeaker;

  if (!isOpen) return null;

  return (
    <div 
      className={`standup-modal-overlay ${isClosing ? 'closing' : ''} ${isSpinning ? 'selecting' : ''}`}
      onClick={handleBackdropClick}
    >
              <div className="standup-modal">
        
        {/* Overlay d'animation de shuffle */}
        {showShuffleOverlay && (
          <div className={`shuffle-overlay ${shufflePhase} ${isShuffleOverlayClosing ? 'closing' : ''}`}>
            <div className="shuffle-animation-container">
              {shufflePhase === 'shuffling' ? (
                <>
                  <div className="shuffle-title">
                    <span className="shuffle-emoji">🎲</span>
                    <h2>Sélection en cours...</h2>
                    <p>Qui va présenter aujourd'hui ?</p>
                  </div>
                  
                  <div className="shuffle-name-display">
                    <div className="shuffle-name">
                      {shuffleNames[currentShuffleIndex] || 'Sélection...'}
                    </div>
                  </div>
                  
                  <div className="shuffle-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </>
              ) : shufflePhase === 'winner' ? (
                <>
                  <div className="winner-title">
                    <span className="winner-emoji">🎉</span>
                    <h2>Sélectionné !</h2>
                    <p>C'est au tour de...</p>
                  </div>
                  
                  <div className="winner-name-display">
                    <div className="winner-name">
                      {winnerName}
                    </div>
                  </div>
                  
                  <div className="winner-celebration">
                    <span>🎊</span>
                    <span>✨</span>
                    <span>🎊</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Header moderne */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">🎯</div>
            <div className="header-text">
              <h2>Session Stand-up</h2>
              <p>Qui va partager ses avancées aujourd'hui ?</p>
            </div>
          </div>
          
          {/* Boutons Azure DevOps */}
          <div className="azure-buttons">
            <button 
              className="azure-button dashboard-button"
              onClick={() => window.open('https://dev.azure.com/bazimo-app/bazimo-app/_dashboards/dashboard/89685afa-83e2-4a48-9c36-2dfce389c5e3', '_blank')}
              title="Ouvrir le Dashboard Azure DevOps"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7l1 1v7l-1 1H3l-1-1V4l1-1zm8 0h7l1 1v7l-1 1h-7l-1-1V4l1-1zm-8 8h7l1 1v7l-1 1H3l-1-1v-7l1-1zm8 0h7l1 1v7l-1 1h-7l-1-1v-7l1-1z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            
            <button 
              className="azure-button boards-button"
              onClick={() => window.open('https://dev.azure.com/bazimo-app/bazimo-app/_boards/board/t/Development%20Team/Stories%20and%20Bugs', '_blank')}
              title="Ouvrir les Boards Azure DevOps"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v6m0 0v6m0-6h10m-10 6h4a2 2 0 0 0 2-2v-4m-6 6v4a2 2 0 0 0 2 2h4m0-10V9a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <button 
            className="close-button"
            onClick={handleClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Speaker Courant - En Haut */}
        <div className="current-speaker-section">
          <div className={`current-speaker-card ${!currentSpeaker ? 'waiting-mode' : ''}`}>
            {currentSpeaker ? (
              <>
                <div className="speaker-status">
                  <span className="live-indicator"></span>
                  <span>EN COURS</span>
                </div>
                
                <div className="speaker-content">
                  <div className="speaker-left">
                    {(() => {
                      const speakerName = String(currentSpeaker.name?.value || currentSpeaker.name || 'Speaker');
                      const avatarColor = getAvatarColor(speakerName);
                      
                      return (
                        <>
                          <div className="current-speaker-avatar">
                            <img 
                              src={getPhotoUrl(currentSpeaker, theme)}
                              alt={speakerName}
                              className="current-speaker-photo"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  target.style.display = 'none';
                                  parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                  parent.innerHTML = `<div class="current-speaker-fallback" style="color: ${avatarColor.text}">${speakerName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                            <div className="speaker-ring"></div>
                          </div>
                          
                          <div className="current-speaker-info">
                            <h3>{speakerName}</h3>
                            <p>Partage ses avancées maintenant</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Bouton Shuffle à droite */}
                  {availableParticipants.length > 0 && (
                    <div className="speaker-right">
                      <button 
                        className="shuffle-button-integrated"
                        onClick={handleShuffleSelect}
                        disabled={isSpinning}
                      >
                        <div className="shuffle-icon">🎲</div>
                        <span>Suivant</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="speaker-status waiting">
                  <span className="waiting-indicator"></span>
                  <span>EN ATTENTE</span>
                </div>
                
                <div className="speaker-content">
                  <div className="speaker-left">
                    {/* Avatar invisible pour maintenir la structure et la taille */}
                    <div className="current-speaker-avatar waiting invisible">
                      <div className="waiting-avatar-placeholder"></div>
                      <div className="speaker-ring waiting"></div>
                    </div>
                    
                    <div className="current-speaker-info">
                      <h3>Prêt à commencer ?</h3>
                      <p>Sélectionnez quelqu'un pour démarrer le stand-up !</p>
                    </div>
                  </div>

                  {/* Bouton Shuffle à droite même en mode attente */}
                  {availableParticipants.length > 0 && (
                    <div className="speaker-right">
                      <button 
                        className="shuffle-button-integrated"
                        onClick={handleShuffleSelect}
                        disabled={isSpinning}
                      >
                        <div className="shuffle-icon">🎲</div>
                        <span>Commencer</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenu principal - Layout 2 colonnes */}
        <div className="modal-content">
          {/* Colonne Gauche - Participants Disponibles */}
          <div className="available-section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">👥</span>
                <h3>En attente</h3>
                <span className="available-count">{availableParticipants.length}</span>
              </div>
            </div>

            {availableParticipants.length > 0 ? (
              <div className="available-grid">
                {availableParticipants.map((participant) => {
                  const participantName = String(participant.name?.value || participant.name || 'P');
                  const avatarColor = getAvatarColor(participantName);
                  const isCurrentSelected = selectedParticipant?.id === participant.id;
                  const isAnimator = currentAnimator && (
                    (currentAnimator.id?.value || currentAnimator.id) === 
                    (participant.id?.value || participant.id)
                  );
                  const isShuffling = isSpinning && selectedParticipant?.id === participant.id;
                  const isWinner = isWinnerRevealed && selectedParticipant?.id === participant.id;
                  
                  return (
                    <div 
                      key={String(participant.id?.value || participant.id)}
                      className={`available-card ${isCurrentSelected ? 'selected' : ''} ${isAnimator ? 'animator' : ''} ${isShuffling ? 'shuffling' : ''} ${isWinner ? 'winner' : ''}`}
                      onClick={() => !isSpinning && handleParticipantSelect(participant)}
                    >
                      <div className="available-avatar">
                        <img 
                          src={getPhotoUrl(participant, theme)}
                          alt={participantName}
                          className="available-photo"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                              parent.innerHTML = `<div class="available-fallback">${participantName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </div>
                      
                      <div className="available-name">
                        {participantName}
                      </div>
                      
                      {isAnimator && <div className="animator-star">⭐</div>}
                      
                      <button 
                        className="select-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          !isSpinning && handleParticipantSelect(participant);
                        }}
                        disabled={isSpinning}
                        title="Sélectionner ce participant"
                      >
                        ▶
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="all-done-state">
                <div className="celebration-icon">🎉</div>
                <h3>Tour terminé !</h3>
                <p>Tous les participants ont partagé</p>
                <button 
                  className="restart-button"
                  onClick={onReset}
                  title="Nouveau tour"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Colonne Droite - Historique (dans l'ordre) */}
          <div className="history-section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">✅</span>
                <h3>Ont parlé</h3>
                <span className="history-count">{participantsWhoSpoke.length}</span>
              </div>
              {participantsWhoSpoke.length > 0 && (
                <button 
                  className="reset-history-button"
                  onClick={onReset}
                  title="Recommencer - Remettre tout le monde en attente"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {participantsWhoSpoke.length > 0 ? (
              <div className="history-list">
                {[...participantsWhoSpoke].reverse().map((participant, index) => {
                  const participantName = String(participant.name?.value || participant.name || 'P');
                  const avatarColor = getAvatarColor(participantName);
                  const isLatestSpeaker = index === 0; // Le premier de la liste inversée
                  const originalOrder = participantsWhoSpoke.length - index; // Ordre original pour l'affichage
                  
                  return (
                    <div 
                      key={String(participant.id?.value || participant.id)}
                      className={`history-item ${isLatestSpeaker ? 'latest-speaker' : ''}`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="history-order">{originalOrder}</div>
                      
                      <div className="history-avatar">
                        <img 
                          src={getPhotoUrl(participant, theme)}
                          alt={participantName}
                          className="history-photo"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                              parent.innerHTML = `<div class="history-fallback">${participantName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                        <div className="done-badge">✓</div>
                      </div>
                      
                      <div className="history-info">
                        <h4>{participantName}</h4>
                        <span className="done-text">Terminé</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-history">
                <div className="waiting-icon">⏳</div>
                <p>Aucun participant n'a encore parlé</p>
                <p className="hint">Utilisez le bouton shuffle pour commencer</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer moderne */}
        <div className="modal-footer">
          <button 
            className="return-button"
            onClick={handleClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Retour au dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 