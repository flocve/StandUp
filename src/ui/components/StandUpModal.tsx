import React, { useState, useEffect } from 'react';
import { DailyParticipant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { DailySelectionUseCases } from '../../application/daily/useCases';
import { useParticipants } from '../../hooks/useParticipants';
import { useDailyParticipants } from '../../hooks/useDailyParticipants';
import { useAnimators } from '../../hooks/useAnimators';
import { getParticipantPhotoUrlWithTheme } from '../../utils/animalPhotos';
import './StandUpModal.css';

interface StandUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  allParticipants?: DailyParticipant[];
  allWeeklyParticipants?: any[];
  onSelect: (participant: any) => void;
  onReset: () => void;
  repository: ParticipantRepository;
  dailyUseCases: DailySelectionUseCases;
  currentAnimator?: any;
  theme?: string;
}

// Étapes de la modale
type StandUpStep = 'selection' | 'shuffle' | 'standUp';

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
  allWeeklyParticipants,
  onSelect,
  onReset,
  repository,
  dailyUseCases,
  currentAnimator,
  theme
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [currentStep, setCurrentStep] = useState<StandUpStep>('selection');
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([]);
  const [shuffledOrder, setShuffledOrder] = useState<any[]>([]);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');

  // Hook pour gérer l'animateur courant
  const {
    getCurrentWeekAnimator,
    getNextWeekAnimator
  } = useAnimators(
    allWeeklyParticipants || [], 
    repository as any
  );

  // Utilitaire pour obtenir le nom sous forme de string
  const getNameString = (participantOrName: any) => {
    if (!participantOrName) return '';
    if (typeof participantOrName === 'string') return participantOrName;
    if (typeof participantOrName.name === 'object' && 'value' in participantOrName.name) return participantOrName.name.value;
    if (typeof participantOrName.value === 'string') return participantOrName.value;
    if (typeof participantOrName.name === 'string') return participantOrName.name;
    return '';
  };

  // Fonction pour déterminer si un participant est l'animateur actuel ou suivant
  const getAnimatorStatus = (participant: any) => {
    const participantName = getNameString(participant);
    const currentWeekEntry = getCurrentWeekAnimator();
    const nextWeekEntry = getNextWeekAnimator();
    
    const isCurrentAnimator = currentWeekEntry && currentWeekEntry.participant && 
      getNameString(currentWeekEntry.participant) === participantName;
    const isNextAnimator = nextWeekEntry && nextWeekEntry.participant && 
      getNameString(nextWeekEntry.participant) === participantName;
    
    return { isCurrentAnimator, isNextAnimator };
  };

  // Initialiser les participants sélectionnés avec tous les participants disponibles
  useEffect(() => {
    if (isOpen && allParticipants) {
      const availableParticipants = allParticipants.filter(p => 
        typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
      );
      setSelectedParticipants(availableParticipants);
      setCurrentStep('selection');
      setCurrentParticipantIndex(0);
      setShuffledOrder([]);
    }
  }, [isOpen, allParticipants]);

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
    // Vérifier s'il y a des participants qui ont parlé
    const participantsWhoSpoke = allParticipants?.filter(p => 
      typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
    ) || [];
    
    const allParticipantsSpoke = allParticipants?.every(p => 
      typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
    ) || false;
    
    // Si certains participants ont parlé (mais pas tous), demander confirmation
    if (participantsWhoSpoke.length > 0 && !allParticipantsSpoke) {
      setShowConfirmClose(true);
      return;
    }
    
    // Sinon, fermer directement
    performClose();
  };

  const performClose = async () => {
    try {
      // Remettre tous les participants à hasSpoken = false
      if (allParticipants) {
        for (const participant of allParticipants) {
          if (participant.reset && typeof participant.reset === 'function') {
            participant.reset();
            await dailyUseCases.updateParticipant(participant);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du reset des participants:', error);
    }
    
    setIsClosing(true);
    setShowConfirmClose(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setCurrentStep('selection');
      setCurrentParticipantIndex(0);
      setShuffledOrder([]);
    }, 250);
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showConfirmClose) {
      handleClose();
    }
  };

  // Gérer la sélection/désélection d'un participant
  const toggleParticipantSelection = (participant: any) => {
    setSelectedParticipants(prev => {
      const isSelected = prev.some(p => (p.id?.value || p.id) === (participant.id?.value || participant.id));
      if (isSelected) {
        return prev.filter(p => (p.id?.value || p.id) !== (participant.id?.value || participant.id));
      } else {
        return [...prev, participant];
      }
    });
  };

  // Lancer le stand-up avec animation shuffle
  const handleStartStandUp = () => {
    if (selectedParticipants.length === 0) return;
    
    setCurrentStep('shuffle');
    setIsShuffling(true);
    
    // Animation de shuffle améliorée et plus courte
    const participantNames = selectedParticipants.map(p => 
      String(p.name?.value || p.name || 'Participant')
    );
    
    let shuffleIndex = 0;
    let shuffleSpeed = 60;
    const maxShuffle = 20; // Réduit de 30 à 20
    let shuffleCount = 0;
    
    const shuffleAnimation = () => {
      if (shuffleCount < maxShuffle) {
        setCurrentShuffleIndex(shuffleIndex % participantNames.length);
        shuffleIndex++;
        shuffleCount++;
        
        // Ralentir progressivement mais plus rapidement
        if (shuffleCount > 12) {
          shuffleSpeed += 30;
        } else if (shuffleCount > 8) {
          shuffleSpeed += 15;
        }
        
        setTimeout(shuffleAnimation, shuffleSpeed);
      } else {
        // Générer l'ordre final aléatoire avec un meilleur algorithme
        const shuffled = [...selectedParticipants];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setShuffledOrder(shuffled);
        setIsShuffling(false);
        setCurrentStep('standUp');
        setCurrentParticipantIndex(0);
      }
    };
    
    shuffleAnimation();
  };

  // Passer au participant suivant
  const handleNextParticipant = async () => {
    if (currentParticipantIndex < shuffledOrder.length - 1) {
      setNavigationDirection('forward');
      setIsSliding(true);
      
      setTimeout(() => {
        setCurrentParticipantIndex(prev => prev + 1);
        setIsSliding(false);
        setIsEntering(true);
        
        // Retirer l'animation d'entrée après qu'elle soit finie
        setTimeout(() => setIsEntering(false), 300);
      }, 300);
    }
  };

  // Revenir au participant précédent
  const handlePreviousParticipant = async () => {
    if (currentParticipantIndex > 0) {
      try {
        setNavigationDirection('backward');
        setIsSliding(true);
        
        // Remettre le participant actuel à hasSpoken = false
        const currentParticipant = shuffledOrder[currentParticipantIndex];
        if (currentParticipant && currentParticipant.reset && typeof currentParticipant.reset === 'function') {
          currentParticipant.reset();
          await dailyUseCases.updateParticipant(currentParticipant);
        }
        
        setTimeout(() => {
          // Revenir au participant précédent
          setCurrentParticipantIndex(prev => prev - 1);
          setIsSliding(false);
          setIsEntering(true);
          
          // Retirer l'animation d'entrée après qu'elle soit finie
          setTimeout(() => setIsEntering(false), 300);
        }, 300);
      } catch (error) {
        console.error('Erreur lors du retour au participant précédent:', error);
        setIsSliding(false);
      }
    }
  };

  // Terminer le stand-up
  const handleFinishStandUp = async () => {
    try {
      // Remettre tous les participants à hasSpoken = false (ils peuvent reparler)
      for (const participant of shuffledOrder) {
        if (participant.reset && typeof participant.reset === 'function') {
          participant.reset();
        } else if (participant.hasSpoken && typeof participant.hasSpoken === 'function') {
          // Si pas de reset, essayer de remettre manuellement le flag
          participant.hasSpokenFlag = false;
        }
        await dailyUseCases.updateParticipant(participant);
      }
      
      // Fermer la modale sans confirmation (on vient de terminer le stand-up)
      performClose();
    } catch (error) {
      console.error('Erreur lors de la finalisation du stand-up:', error);
    }
  };

  // Reset pour revenir à l'étape de sélection
  const handleResetToSelection = () => {
    setCurrentStep('selection');
    setCurrentParticipantIndex(0);
    setShuffledOrder([]);
    setIsShuffling(false);
    // Réinitialiser les participants sélectionnés avec tous les participants disponibles
    if (allParticipants) {
      const availableParticipants = allParticipants.filter(p => 
        typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
      );
      setSelectedParticipants(availableParticipants);
    }
  };

  if (!isOpen) return null;

  const currentParticipant = shuffledOrder[currentParticipantIndex];
  const isLastParticipant = currentParticipantIndex === shuffledOrder.length - 1;

  return (
    <div 
      className={`standup-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
    >
      {showConfirmClose && (
        <div className="confirm-modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="confirm-modal">
            <h3>Confirmer la fermeture</h3>
            <p>
              Certains participants ont déjà parlé. Fermer la modale va remettre 
              tous les participants à l'état "non parlé". Voulez-vous continuer ?
            </p>
            <div className="confirm-actions">
              <button className="cancel-button" onClick={handleCancelClose}>
                Annuler
              </button>
              <button className="confirm-button" onClick={performClose}>
                Oui, fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="standup-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="header-icon">🎯</div>
            <div className="header-text">
              <h2>Session Stand-up</h2>
              <p>
                {currentStep === 'selection' && 'Sélectionnez les participants'}
                {currentStep === 'shuffle' && 'Génération de l\'ordre...'}
                {currentStep === 'standUp' && `Participant ${currentParticipantIndex + 1}/${shuffledOrder.length}`}
              </p>
            </div>
          </div>
          
          <button className="close-button" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Contenu selon l'étape */}
        <div className="modal-content">
          {currentStep === 'selection' && (
            <div className="selection-step">
              <div className="step-header">
                <h3>Qui participe au stand-up aujourd'hui ?</h3>
                <p>Tous les participants sont sélectionnés par défaut. Désélectionnez ceux qui ne participent pas.</p>
              </div>
              
              <div className="participants-grid">
                {allParticipants?.filter(p => 
                  typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
                ).map((participant) => {
                  const participantName = String(participant.name?.value || participant.name || 'Participant');
                  const avatarColor = getAvatarColor(participantName);
                  const isSelected = selectedParticipants.some(p => 
                    (p.id?.value || p.id) === (participant.id?.value || participant.id)
                  );
                  
                  const { isCurrentAnimator, isNextAnimator } = getAnimatorStatus(participant);
                  
                  return (
                    <div 
                      key={String(participant.id?.value || participant.id)}
                      className={`participant-card ${isSelected ? 'selected' : 'unselected'}`}
                      onClick={() => toggleParticipantSelection(participant)}
                    >
                      <div className="participant-avatar" style={{ position: 'relative' }}>
                        {isCurrentAnimator && <div className="participant-crown">👑</div>}
                        {isNextAnimator && !isCurrentAnimator && <div className="participant-silver-crown">👑</div>}
                        <img 
                          src={getPhotoUrl(participant, theme)}
                          alt={participantName}
                          className="participant-photo"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                              parent.innerHTML = `<div class="participant-fallback" style="color: ${avatarColor.text}">${participantName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      </div>
                      <div className="participant-name">{participantName}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="step-actions">
                <div className="selected-count">
                  {selectedParticipants.length} participant{selectedParticipants.length > 1 ? 's' : ''} sélectionné{selectedParticipants.length > 1 ? 's' : ''}
                </div>
                <button 
                  className="start-standup-button"
                  onClick={handleStartStandUp}
                  disabled={selectedParticipants.length === 0}
                >
                  🚀 Lancer le stand-up
                </button>
              </div>
            </div>
          )}

          {currentStep === 'shuffle' && (
            <div className="shuffle-step">
              <div className="shuffle-animation">
                <div className="shuffle-title">
                  <h3>🎲 Génération de l'ordre de passage...</h3>
                </div>
                
                <div className="shuffle-display">
                  <div className="shuffle-name">
                    {isShuffling ? 
                      selectedParticipants[currentShuffleIndex]?.name?.value || 
                      selectedParticipants[currentShuffleIndex]?.name || 
                      'Participant'
                      : 'Prêt !'
                    }
                  </div>
                </div>
                
                <div className="shuffle-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                
                {!isShuffling && (
                  <div className="shuffle-actions">
                    <button 
                      className="reset-button"
                      onClick={handleResetToSelection}
                      title="Revenir à la sélection des participants"
                    >
                      🔄 Revenir à la sélection
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'standUp' && currentParticipant && (
            <div className="standup-step">
              <div 
                className={`current-participant-display ${isSliding ? `sliding-out ${navigationDirection}` : ''}`}
                style={{
                  animation: isEntering ? 
                    (navigationDirection === 'backward' ? 'slideInFromLeft 0.3s ease-out' : 'slideInFromRight 0.3s ease-out') 
                    : 'none'
                }}
              >
                <div className="participant-avatar-large" style={{ position: 'relative' }}>
                  {(() => {
                    const { isCurrentAnimator, isNextAnimator } = getAnimatorStatus(currentParticipant);
                    return (
                      <>
                        {isCurrentAnimator && <div className="current-participant-crown">👑</div>}
                        {isNextAnimator && !isCurrentAnimator && <div className="current-participant-silver-crown">👑</div>}
                      </>
                    );
                  })()}
                  <img 
                    src={getPhotoUrl(currentParticipant, theme)}
                    alt={String(currentParticipant.name?.value || currentParticipant.name || 'Participant')}
                    className="participant-photo-large"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        const participantName = String(currentParticipant.name?.value || currentParticipant.name || 'Participant');
                        const avatarColor = getAvatarColor(participantName);
                        target.style.display = 'none';
                        parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                        parent.innerHTML = `<div class="participant-fallback-large" style="color: ${avatarColor.text}">${participantName.charAt(0).toUpperCase()}</div>`;
                      }
                    }}
                  />
                </div>
                
                <h2 className="current-participant-name">
                  {String(currentParticipant.name?.value || currentParticipant.name || 'Participant')}
                </h2>
                
                <div className="participant-status">
                  C'est à ton tour de parler !
                </div>
              </div>
              
              <div className="progress-indicator">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${((currentParticipantIndex + 1) / shuffledOrder.length) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {currentParticipantIndex + 1} / {shuffledOrder.length}
                </div>
              </div>
              
              <div className="standup-actions">
                {!isLastParticipant ? (
                  <div className="standup-action-buttons">
                    {currentParticipantIndex > 0 && (
                      <button 
                        className="previous-button"
                        onClick={handlePreviousParticipant}
                        title="Revenir au participant précédent"
                      >
                        ← Précédent
                      </button>
                    )}
                    <div className="standup-action-buttons-right">
                      <button 
                        className="next-participant-button"
                        onClick={handleNextParticipant}
                      >
                        Suivant →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="standup-action-buttons">
                    {currentParticipantIndex > 0 && (
                      <button 
                        className="previous-button"
                        onClick={handlePreviousParticipant}
                        title="Revenir au participant précédent"
                      >
                        ← Précédent
                      </button>
                    )}
                    <div className="standup-action-buttons-right">
                      <button 
                        className="finish-standup-button"
                        onClick={handleFinishStandUp}
                      >
                        🎉 Terminer le stand-up !!
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 