import React, { useState, useEffect } from 'react';
import type { DailyParticipant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { DailySelectionUseCases } from '../../application/daily/useCases';
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

export const StandUpModal: React.FC<StandUpModalProps> = ({
  isOpen,
  onClose,
  participants,
  allParticipants,
  onSelect,
  onReset,
  repository,
  dailyUseCases,
  currentAnimator
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setSelectedParticipant(null);
      setIsSelecting(false);
      setShowSuccessAnimation(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleParticipantSelect = async (participant: any) => {
    setSelectedParticipant(participant);
    setIsSelecting(true);
    
    // Animation de sélection
    setTimeout(() => {
      setShowSuccessAnimation(true);
    }, 800);
    
    // Appel de la fonction de sélection
    setTimeout(() => {
      onSelect(participant);
      setIsSelecting(false);
      setShowSuccessAnimation(false);
      handleClose();
    }, 1500);
  };

  const handleRandomSelect = () => {
    const availableParticipants = allParticipants?.filter(p => 
      typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
    );
    if (availableParticipants && availableParticipants.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length);
      handleParticipantSelect(availableParticipants[randomIndex]);
    }
  };

  // Calculer les participants qui ont parlé (dans l'ordre)
  const participantsWhoSpoke = allParticipants?.filter(p => 
    typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
  ) || [];

  const availableParticipants = allParticipants?.filter(p => 
    typeof p.hasSpoken === 'function' ? !p.hasSpoken() : !p.hasSpoken
  ) || [];

  // Trouver le speaker courant (celui qui vient d'être sélectionné)
  const currentSpeaker = participants && participants.length > 0 ? participants[0] : null;

  if (!isOpen) return null;

  return (
    <div 
      className={`standup-modal-overlay ${isClosing ? 'closing' : ''} ${isSelecting ? 'selecting' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className="standup-modal">
        {/* Animation de sélection overlay */}
        {isSelecting && (
          <div className="selection-overlay">
            <div className="selection-animation">
              <div className="selection-spinner"></div>
              <div className="selection-text">
                {showSuccessAnimation ? (
                  <>
                    <div className="success-icon">🎉</div>
                    <h3>Sélectionné !</h3>
                    <p>{selectedParticipant?.name?.value || selectedParticipant?.name}</p>
                  </>
                ) : (
                  <>
                    <h3>Sélection en cours...</h3>
                    <p>Préparation du stand-up</p>
                  </>
                )}
              </div>
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
        {currentSpeaker && (
          <div className="current-speaker-section">
            <div className="current-speaker-card">
              <div className="speaker-status">
                <span className="live-indicator"></span>
                <span>EN COURS</span>
              </div>
              
              {(() => {
                const speakerName = String(currentSpeaker.name?.value || currentSpeaker.name || 'Speaker');
                const avatarColor = getAvatarColor(speakerName);
                const hasPhoto = 'getPhotoUrl' in currentSpeaker && currentSpeaker.getPhotoUrl && currentSpeaker.getPhotoUrl();
                
                return (
                  <>
                    <div className="current-speaker-avatar">
                      {hasPhoto ? (
                        <img 
                          src={currentSpeaker.getPhotoUrl!()}
                          alt={speakerName}
                          className="current-speaker-photo"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                              parent.innerHTML = `<div class="current-speaker-fallback">${speakerName.charAt(0).toUpperCase()}</div>`;
                            }
                          }}
                        />
                      ) : (
                        <div 
                          className="current-speaker-fallback"
                          style={{
                            background: `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`,
                            color: avatarColor.text
                          }}
                        >
                          {speakerName.charAt(0).toUpperCase()}
                        </div>
                      )}
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
          </div>
        )}

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
              <>
                <div className="available-grid">
                  {availableParticipants.map((participant) => {
                    const participantName = String(participant.name?.value || participant.name || 'P');
                    const avatarColor = getAvatarColor(participantName);
                    const hasPhoto = 'getPhotoUrl' in participant && participant.getPhotoUrl && participant.getPhotoUrl();
                    const isCurrentSelected = selectedParticipant?.id === participant.id;
                    const isAnimator = currentAnimator && (
                      (currentAnimator.id?.value || currentAnimator.id) === 
                      (participant.id?.value || participant.id)
                    );
                    
                    return (
                      <div 
                        key={String(participant.id?.value || participant.id)}
                        className={`available-card ${isCurrentSelected ? 'selected' : ''} ${isAnimator ? 'animator' : ''}`}
                        onClick={() => handleParticipantSelect(participant)}
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
                        
                        {isAnimator && <div className="animator-star">⭐</div>}
                      </div>
                    );
                  })}
                </div>

                <div className="shuffle-section">
                  <button 
                    className="shuffle-button"
                    onClick={handleRandomSelect}
                    disabled={isSelecting}
                  >
                    <div className="shuffle-icon">🎲</div>
                    <span>Shuffle & Sélectionner</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="all-done-state">
                <div className="celebration-icon">🎉</div>
                <h3>Tour terminé !</h3>
                <p>Tous les participants ont partagé</p>
                <button 
                  className="restart-button"
                  onClick={onReset}
                >
                  <span>🔄</span>
                  Nouveau tour
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
            </div>

            {participantsWhoSpoke.length > 0 ? (
              <div className="history-list">
                {participantsWhoSpoke.map((participant, index) => {
                  const participantName = String(participant.name?.value || participant.name || 'P');
                  const avatarColor = getAvatarColor(participantName);
                  const hasPhoto = 'getPhotoUrl' in participant && participant.getPhotoUrl && participant.getPhotoUrl();
                  
                  return (
                    <div 
                      key={String(participant.id?.value || participant.id)}
                      className="history-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="history-order">{index + 1}</div>
                      
                      <div className="history-avatar">
                        {hasPhoto ? (
                          <img 
                            src={participant.getPhotoUrl!()}
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