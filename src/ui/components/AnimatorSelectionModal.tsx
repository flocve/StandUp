import React, { useState, useEffect } from 'react';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import { useAnimators } from '../../hooks/useAnimators';
import { getParticipantPhotoUrlWithTheme } from '../../utils/animalPhotos';
import './AnimatorSelectionModal.css';

interface AnimatorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  onSelect: (participant: any) => void;
  repository: ParticipantRepository;
  weeklyUseCases: WeeklySelectionUseCases;
  currentAnimator?: any;
  nextWeekAnimator?: any;
  theme?: string;
}

export const AnimatorSelectionModal: React.FC<AnimatorSelectionModalProps> = ({
  isOpen,
  onClose,
  participants,
  onSelect,
  repository,
  weeklyUseCases,
  currentAnimator,
  theme
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [showSelectionOverlay, setShowSelectionOverlay] = useState(false);
  const [isSelectionOverlayClosing, setIsSelectionOverlayClosing] = useState(false);
  const [selectedAnimatorName, setSelectedAnimatorName] = useState<string>('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'battle-royal' | 'duel' | 'winner'>('battle-royal');
  const [remainingParticipants, setRemainingParticipants] = useState<any[]>([]);
  const [eliminatedParticipants, setEliminatedParticipants] = useState<any[]>([]);
  const [currentElimination, setCurrentElimination] = useState<any>(null);
  const [duelCandidates, setDuelCandidates] = useState<any[]>([]);
  const [currentShuffleIndex, setCurrentShuffleIndex] = useState(0);
  const [winnerName, setWinnerName] = useState<string>('');
  
  // Utiliser le hook useAnimators pour les vraies données
  const { animatorHistory, addAnimator, getParticipantChancePercentage } = useAnimators(
    participants, 
    repository as any // Cast temporaire pour la compatibilité
  );

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

  // Fonction pour déterminer la classe CSS selon la longueur du nom
  const getDuelNameClass = (name: string) => {
    const baseClass = 'duel-name';
    if (name.length > 10) {
      return `${baseClass} very-long-name`;
    } else if (name.length > 7) {
      return `${baseClass} long-name`;
    }
    return baseClass;
  };

  // Fonction helper pour obtenir l'URL de photo avec support du thème
  const getPhotoUrl = (participant: any) => {
    const participantName = String(participant?.name?.value || participant?.name || 'Participant');
    const customPhotoUrl = participant?.getPhotoUrl?.();
    return getParticipantPhotoUrlWithTheme(participantName, customPhotoUrl, theme);
  };

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

  const handleAnimatorSelect = async (participant: any) => {
    if (isSelecting) return;
    
    try {
      setIsSelecting(true);
      const finalWinnerName = String(participant.name?.value || participant.name || 'Animateur');
      
      // Préparer le battle royal avec tous les participants
      setRemainingParticipants([...participants]);
      setEliminatedParticipants([]);
      setCurrentElimination(null);
      setBattlePhase('battle-royal');
      setWinnerName('');
      
      // Afficher l'overlay d'animation
      setShowSelectionOverlay(true);
      
      console.log('🥊 Battle Royal commencé avec', participants.length, 'participants');
      
      // Démarrer le battle royal
      setTimeout(() => startBattleRoyal(participant, finalWinnerName), 1000);
      
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'animateur:', error);
      setIsSelecting(false);
    }
  };

  const startBattleRoyal = (finalWinner: any, finalWinnerName: string) => {
    let currentParticipants = [...participants];
    
    const eliminateParticipant = () => {
      if (currentParticipants.length <= 2) {
        // DUEL FINAL !
        console.log('⚔️ DUEL FINAL !');
        setDuelCandidates(currentParticipants);
        setBattlePhase('duel');
        setTimeout(() => startEpicDuel(finalWinner, finalWinnerName), 1000);
        return;
      }
      
      // Éliminer un participant (sauf le gagnant final)
      const eliminationCandidates = currentParticipants.filter(p => 
        String(p.name?.value || p.name || 'Participant') !== finalWinnerName || currentParticipants.length === 2
      );
      
      const victimIndex = Math.floor(Math.random() * eliminationCandidates.length);
      const victim = eliminationCandidates[victimIndex];
      
      // Animation d'élimination
      setCurrentElimination(victim);
      console.log('💥 Élimination de', String(victim.name?.value || victim.name));
      
      setTimeout(() => {
        // Retirer le participant éliminé
        const realIndex = currentParticipants.findIndex(p => p === victim);
        currentParticipants.splice(realIndex, 1);
        
        setRemainingParticipants([...currentParticipants]);
        setEliminatedParticipants(prev => [...prev, victim]);
        setCurrentElimination(null);
        
        // Pause avant la prochaine élimination (2x plus rapide)
        const delay = currentParticipants.length > 3 ? 1000 : 1500;
        setTimeout(eliminateParticipant, delay);
      }, 1250); // 2x plus rapide
    };
    
    // Première élimination (2x plus rapide)
    setTimeout(eliminateParticipant, 1000);
  };

  const startEpicDuel = (finalWinner: any, finalWinnerName: string) => {
    let duelIndex = 0;
    let duelIterations = 50;
    const baseDuelDelay = 60;
    
    const animateDuel = () => {
      if (duelIterations > 0) {
        setCurrentShuffleIndex(duelIndex % 2);
        duelIndex++;
        duelIterations--;
        
        let currentDelay = baseDuelDelay;
        const progress = (50 - duelIterations) / 50;
        
        if (progress < 0.3) {
          currentDelay = baseDuelDelay - (progress / 0.3) * 20;
        } else if (progress < 0.7) {
          currentDelay = 40;
        } else if (progress < 0.9) {
          currentDelay = 40 + ((progress - 0.7) / 0.2) * 160;
        } else {
          currentDelay = 300;
        }
        
        setTimeout(animateDuel, Math.floor(currentDelay));
      } else {
        // Duel terminé !
        console.log('🏆 Victoire !');
        setWinnerName(finalWinnerName);
        setBattlePhase('winner');
        
        // Finaliser la sélection
        setTimeout(async () => {
          try {
            await addAnimator(finalWinner);
            await onSelect(finalWinner);
            
            setTimeout(() => {
              setIsSelectionOverlayClosing(true);
              setTimeout(() => {
                setShowSelectionOverlay(false);
                setIsSelectionOverlayClosing(false);
                setIsSelecting(false);
              }, 800);
            }, 2000);
          } catch (error) {
            console.error('Erreur:', error);
            setShowSelectionOverlay(false);
            setIsSelecting(false);
          }
        }, 1000);
      }
    };
    
    setTimeout(animateDuel, 500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`animator-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="animator-modal liquid-glass-strong">
        {/* Header de la modale */}
        <div className="modal-header liquid-glass-subtle">
          <div className="header-content">
            <h2>Sélection de l'animateur</h2>
            <p>Choisissez l'animateur pour la semaine prochaine</p>
          </div>
          <button 
            className="close-button"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Animateur Courant - En Haut */}
        <div className="current-animator-section">
          <div className={`current-animator-card ${!currentAnimator ? 'waiting-mode' : ''}`}>
            {currentAnimator ? (
              <>
                <div className="animator-status">
                  <span className="live-indicator"></span>
                  <span>ANIMATEUR ACTUEL</span>
                </div>
                
                <div className="animator-content">
                  <div className="animator-left">
                    {(() => {
                      const animatorName = String(currentAnimator.name?.value || currentAnimator.name || 'Animateur');
                      const avatarColor = getAvatarColor(animatorName);
                      
                      return (
                        <>
                          <div className="current-animator-avatar">
                            <img 
                              src={getPhotoUrl(currentAnimator)}
                              alt={animatorName}
                              className="current-animator-photo"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  target.style.display = 'none';
                                  parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                  parent.innerHTML = `<div class="current-animator-fallback" style="color: ${avatarColor.text}">${animatorName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                            <div className="animator-ring"></div>
                          </div>
                          
                          <div className="current-animator-info">
                            <h3>{animatorName}</h3>
                            <p>Anime l'équipe cette semaine</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Bouton Sélection à droite */}
                  <div className="animator-right">
                    <button 
                      className="selection-button-integrated liquid-glass-button"
                      onClick={() => {
                        // Sélection aléatoire pondérée
                        const availableParticipants = participants.filter(p => 
                          !currentAnimator || (currentAnimator.id?.value || currentAnimator.id) !== (p.id?.value || p.id)
                        );
                        if (availableParticipants.length > 0) {
                          const randomParticipant = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
                          handleAnimatorSelect(randomParticipant);
                        }
                      }}
                    >
                      <div className="selection-icon">👑</div>
                      <span>Changer</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="animator-status waiting">
                  <span className="waiting-indicator"></span>
                  <span>EN ATTENTE</span>
                </div>
                
                <div className="animator-content">
                  <div className="animator-left">
                    <div className="current-animator-info">
                      <h3>Aucun animateur sélectionné</h3>
                      <p>Choisissez un animateur pour la semaine prochaine !</p>
                    </div>
                  </div>

                  {/* Bouton Sélection à droite même en mode attente */}
                  <div className="animator-right">
                    <button 
                      className="selection-button-integrated liquid-glass-button"
                      onClick={() => {
                        // Sélection aléatoire pondérée
                        const availableParticipants = participants.filter(p => 
                          !currentAnimator || (currentAnimator.id?.value || currentAnimator.id) !== (p.id?.value || p.id)
                        );
                        if (availableParticipants.length > 0) {
                          const randomParticipant = availableParticipants[Math.floor(Math.random() * availableParticipants.length)];
                          handleAnimatorSelect(randomParticipant);
                        }
                      }}
                    >
                      <div className="selection-icon">👑</div>
                      <span>Sélectionner</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenu principal - 2 colonnes */}
        <div className="modal-content">
          {/* Colonne Gauche - Participants Disponibles */}
          <div className="available-section liquid-glass-subtle">
            <div className="section-header">
              <div className="section-title">
                <span className="section-icon">👑</span>
                <h3>Candidats animateurs</h3>
                <span className="available-count">{participants.length}</span>
              </div>
            </div>

            <div className="available-grid">
              {(() => {
                // Calculer tous les pourcentages d'abord
                const participantsWithChances = participants.map((participant) => {
                  const chancePercentage = getParticipantChancePercentage ? 
                    getParticipantChancePercentage(participant) : 
                    Math.round(100 / Math.max(1, participant.getChancePercentage?.() || 1));
                  return { participant, chancePercentage };
                });
                
                // Trouver le pourcentage maximum
                const maxChancePercentage = Math.max(...participantsWithChances.map(p => p.chancePercentage));
                
                return participantsWithChances.map(({ participant, chancePercentage }) => {
                  const participantName = String(participant.name?.value || participant.name || 'Participant');
                  const avatarColor = getAvatarColor(participantName);
                  const isCurrentAnimator = currentAnimator && (
                    (currentAnimator.id?.value || currentAnimator.id) === 
                    (participant.id?.value || participant.id)
                  );
                  const isTopChance = chancePercentage === maxChancePercentage && maxChancePercentage > 0;
                
                return (
                  <div 
                    key={String(participant.id?.value || participant.id)}
                    className={`available-card liquid-glass-interactive ${isCurrentAnimator ? 'current-animator' : ''} ${isTopChance ? 'top-chance' : ''}`}
                    onClick={() => !isCurrentAnimator && handleAnimatorSelect(participant)}
                  >
                    <div className="available-avatar">
                      <img 
                        src={getPhotoUrl(participant)}
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
                    
                    <div className="chance-percentage">
                      {chancePercentage}% chance
                    </div>
                    
                    {isCurrentAnimator && <div className="animator-crown">👑</div>}
                  </div>
                );
                });
              })()}
            </div>


          </div>

          {/* Zone historique */}
          <div className="history-zone liquid-glass-subtle">
            <div className="zone-header">
              <h3>📈 Historique des animateurs</h3>
              <div className="history-count">
                {animatorHistory.length} entrées
              </div>
            </div>
            
            <div className="history-container">
              {animatorHistory.length > 0 ? (
                <div className="history-list">
                  {animatorHistory.slice(0, 10).map((entry, index) => {
                    const participantName = String(entry.participant.name?.value || entry.participant.name || 'Animateur');
                    const avatarColor = getAvatarColor(participantName);
                    const hasPhoto = 'getPhotoUrl' in entry.participant && entry.participant.getPhotoUrl && entry.participant.getPhotoUrl();
                    const isLatest = index === 0;
                    
                    return (
                      <div 
                        key={`${String(entry.participant.id?.value || entry.participant.id)}-${entry.date.getTime()}`}
                        className={`history-item ${isLatest ? 'latest' : ''}`}
                      >
                        <div className="history-avatar">
                          {hasPhoto ? (
                            <img 
                              src={entry.participant.getPhotoUrl!()}
                              alt={participantName}
                              className="history-photo"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  target.style.display = 'none';
                                  parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                  parent.innerHTML = `<div class="history-fallback" style="color: ${avatarColor.text}">${participantName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="history-fallback"
                              style={{
                                background: `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`,
                                color: avatarColor.text
                              }}
                            >
                              {participantName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {isLatest && <div className="latest-badge">👑</div>}
                        </div>
                        
                        <div className="history-info">
                          <h4>{participantName}</h4>
                          <span className="history-date">
                            {entry.date.toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-history">
                  <div className="no-history-icon">📈</div>
                  <p>Aucun historique d'animateur</p>
                  <p className="no-history-hint">L'historique apparaîtra après la première sélection</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec bouton retour */}
        <div className="modal-footer">
          <button 
            className="back-button"
            onClick={handleClose}
          >
            ← Retour au dashboard
          </button>
        </div>

        {/* Overlay d'animation de sélection */}
        {showSelectionOverlay && (
          <div className={`selection-overlay ${battlePhase} ${isSelectionOverlayClosing ? 'closing' : ''}`}>
            <div className="selection-animation-container">
              {battlePhase === 'battle-royal' ? (
                <>
                  <div className="selection-title">
                    <span className="selection-emoji">🥊</span>
                    <h2>BATTLE ROYAL</h2>
                    <p>Élimination en cours...</p>
                  </div>
                  
                  <div className="battle-counter">
                    <h3>Participants restants: {remainingParticipants.length}</h3>
                    <p>Élimination progressive jusqu'au duel final</p>
                  </div>
                  
                  <div className="battle-royal-arena">
                    {participants.map((participant) => {
                      const participantName = String(participant.name?.value || participant.name || 'Participant');
                      const avatarColor = getAvatarColor(participantName);
                      const isRemaining = remainingParticipants.some(p => p === participant);
                      const isEliminating = currentElimination === participant;
                      const isEliminated = eliminatedParticipants.some(p => p === participant);
                      
                      return (
                        <div 
                          key={String(participant.id?.value || participant.id)}
                          className={`battle-participant ${
                            isEliminating ? 'eliminating' : 
                            isEliminated ? 'eliminated' : 
                            isRemaining ? 'remaining' : ''
                          }`}
                        >
                          <div className="battle-avatar">
                            <img 
                              src={getPhotoUrl(participant)}
                              alt={participantName}
                              className="battle-avatar-photo"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  target.style.display = 'none';
                                  parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                  parent.innerHTML = `<div class="battle-avatar-fallback" style="color: ${avatarColor.text}">${participantName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                          </div>
                          <div className="battle-name">{participantName}</div>
                          {isEliminating && <div className="elimination-effect">😅</div>}
                          {isEliminated && <div className="elimination-effect">😌</div>}
                        </div>
                      );
                    })}
                  </div>
                  
                  {currentElimination && (
                    <div className="elimination-announcement">
                      😌 SAUVÉ: {String(currentElimination.name?.value || currentElimination.name)} ÉCHAPPE À LA PUNITION !
                    </div>
                  )}
                </>
              ) : battlePhase === 'duel' ? (
                <>
                  <div className="card-duel-title">
                    <span className="duel-emoji">🃏</span>
                    <h2>QUI SERA L'ANIMATEUR SACRIFIÉ ?</h2>
                    <p>Les deux derniers candidats s'affrontent dans un duel de cartes...</p>
                  </div>
                  
                  <div className="card-battle-arena">
                    <div className={`duel-card left ${currentShuffleIndex === 0 ? 'winner-card' : ''}`}>
                      <div className="card-glow"></div>
                      <div className="card-inner">
                        <div className="card-header">
                          <div className="card-title">CANDIDAT #1</div>
                          <div className="card-stress">😰</div>
                        </div>
                        
                        {(() => {
                          const candidate = duelCandidates[0];
                          if (!candidate) return null;
                          
                          const candidateName = String(candidate.name?.value || candidate.name || 'Candidat');
                          const avatarColor = getAvatarColor(candidateName);
                          
                          return (
                            <>
                              <div className="card-avatar">
                                <img 
                                  src={getPhotoUrl(candidate)}
                                  alt={candidateName}
                                  className="card-photo"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      target.style.display = 'none';
                                      parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                      parent.innerHTML = `<div class="card-fallback" style="color: ${avatarColor.text}">${candidateName.charAt(0).toUpperCase()}</div>`;
                                    }
                                  }}
                                />
                              </div>
                              <div className="card-name">{candidateName}</div>
                              <div className="card-fate">Risque d'être animateur...</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="battle-vs-section">
                      <div className="vs-lightning">⚡</div>
                      <div className="vs-text">VS</div>
                      <div className="vs-fire">🔥</div>
                    </div>
                    
                    <div className={`duel-card right ${currentShuffleIndex === 1 ? 'winner-card' : ''}`}>
                      <div className="card-glow"></div>
                      <div className="card-inner">
                        <div className="card-header">
                          <div className="card-title">CANDIDAT #2</div>
                          <div className="card-stress">😰</div>
                        </div>
                        
                        {(() => {
                          const candidate = duelCandidates[1];
                          if (!candidate) return null;
                          
                          const candidateName = String(candidate.name?.value || candidate.name || 'Candidat');
                          const avatarColor = getAvatarColor(candidateName);
                          
                          return (
                            <>
                              <div className="card-avatar">
                                <img 
                                  src={getPhotoUrl(candidate)}
                                  alt={candidateName}
                                  className="card-photo"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      target.style.display = 'none';
                                      parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                      parent.innerHTML = `<div class="card-fallback" style="color: ${avatarColor.text}">${candidateName.charAt(0).toUpperCase()}</div>`;
                                    }
                                  }}
                                />
                              </div>
                              <div className="card-name">{candidateName}</div>
                              <div className="card-fate">Risque d'être animateur...</div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="duel-highlight">
                    <div className="card-duel-spotlight">
                      {String(duelCandidates[currentShuffleIndex]?.name?.value || duelCandidates[currentShuffleIndex]?.name || '')}
                    </div>
                  </div>
                </>
              ) : battlePhase === 'winner' ? (
                <>
                  <div className="winner-title">
                    <span className="winner-emoji">😅</span>
                    <h2>ANIMATEUR SACRIFIÉ !</h2>
                    <p>Bonne chance pour animer cette semaine...</p>
                  </div>
                  
                  <div className="winner-name-display">
                    <div className="winner-name">
                      {winnerName}
                    </div>
                  </div>
                  
                  <div className="winner-celebration">
                    <span>😂</span>
                    <span>🎭</span>
                    <span>💪</span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 