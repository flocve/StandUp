import React, { useState, useEffect } from 'react';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import { useAnimators } from '../../hooks/useAnimators';
import './AnimatorSelectionModal.css';

interface AnimatorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: any[];
  onSelect: (participant: any) => void;
  repository: ParticipantRepository;
  weeklyUseCases: WeeklySelectionUseCases;
  currentAnimator?: any;
}

export const AnimatorSelectionModal: React.FC<AnimatorSelectionModalProps> = ({
  isOpen,
  onClose,
  participants,
  onSelect,
  repository,
  weeklyUseCases,
  currentAnimator
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
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
    try {
      // Utiliser le hook pour ajouter l'animateur
      await addAnimator(participant);
      
      // Appeler la logique de sélection
      await onSelect(participant);
      
      // Fermer la modale après un délai pour voir l'animation
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'animateur:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`animator-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="animator-modal">
        {/* Header de la modale */}
        <div className="modal-header">
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
                
                {(() => {
                  const animatorName = String(currentAnimator.name?.value || currentAnimator.name || 'Animateur');
                  const avatarColor = getAvatarColor(animatorName);
                  
                  let photoUrl = null;
                  if ('getPhotoUrl' in currentAnimator && typeof currentAnimator.getPhotoUrl === 'function') {
                    try {
                      photoUrl = currentAnimator.getPhotoUrl();
                    } catch (error) {
                      // Erreur silencieuse
                    }
                  }
                  
                  const hasPhoto = photoUrl && photoUrl.trim() !== '';
                  
                  return (
                    <>
                      <div className="current-animator-avatar">
                        {hasPhoto ? (
                          <img 
                            src={photoUrl}
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
                        ) : (
                          <div 
                            className="current-animator-fallback"
                            style={{
                              background: `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`,
                              color: avatarColor.text
                            }}
                          >
                            {animatorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="animator-ring"></div>
                      </div>
                      
                      <div className="current-animator-info">
                        <h3>{animatorName}</h3>
                        <p>Anime l'équipe cette semaine</p>
                      </div>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <div className="animator-status waiting">
                  <span className="waiting-indicator"></span>
                  <span>EN ATTENTE</span>
                </div>
                
                <div className="current-animator-info">
                  <h3>Aucun animateur sélectionné</h3>
                  <p>Choisissez un animateur pour la semaine prochaine !</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenu principal - 2 colonnes */}
        <div className="modal-content">
          {/* Colonne Gauche - Participants Disponibles */}
          <div className="available-section">
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
                  const hasPhoto = 'getPhotoUrl' in participant && participant.getPhotoUrl && participant.getPhotoUrl();
                  const isCurrentAnimator = currentAnimator && (
                    (currentAnimator.id?.value || currentAnimator.id) === 
                    (participant.id?.value || participant.id)
                  );
                  const isTopChance = chancePercentage === maxChancePercentage && maxChancePercentage > 0;
                
                return (
                  <div 
                    key={String(participant.id?.value || participant.id)}
                    className={`available-card ${isCurrentAnimator ? 'current-animator' : ''} ${isTopChance ? 'top-chance' : ''}`}
                    onClick={() => !isCurrentAnimator && handleAnimatorSelect(participant)}
                  >
                    <div className="available-avatar">
                      {hasPhoto ? (
                        <img 
                          src={participant.getPhotoUrl!()}
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
                      ) : (
                        <div 
                          className="available-fallback"
                          style={{
                            background: `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`,
                            color: avatarColor.text
                          }}
                        >
                          {participantName.charAt(0).toUpperCase()}
                        </div>
                      )}
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

            <div className="shuffle-section">
              <button 
                className="shuffle-button"
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
                <div className="shuffle-icon">🎲</div>
                <span>Sélection Aléatoire</span>
              </button>
            </div>
          </div>

          {/* Zone historique */}
          <div className="history-zone">
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
      </div>
    </div>
  );
}; 