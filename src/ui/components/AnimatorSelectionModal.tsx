import React, { useState, useEffect } from 'react';
import type { ParticipantRepository } from '../../domain/participant/repository';
import type { WeeklySelectionUseCases } from '../../application/weekly/useCases';
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
  const [animatorHistory, setAnimatorHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadAnimatorHistory();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadAnimatorHistory = async () => {
    try {
      if (repository && 'getAnimatorHistory' in repository) {
        const history = await (repository as any).getAnimatorHistory();
        setAnimatorHistory(history || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

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
      // Appeler la logique de sélection
      await onSelect(participant);
      
      // Recharger l'historique
      await loadAnimatorHistory();
      
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

        {/* Contenu principal */}
        <div className="modal-content">
          {/* Zone de sélection */}
          <div className="selection-zone">
            <div className="zone-header">
              <h3>👑 Sélection de l'animateur</h3>
              {currentAnimator && (
                <div className="current-animator-info">
                  <span>Actuel: {currentAnimator.name?.value || currentAnimator.name || 'Animateur'}</span>
                </div>
              )}
            </div>
            
            <div className="selection-container">
              <div className="temp-selection">
                <p>Zone de sélection d'animateur temporaire</p>
                <p>Participants: {participants.length}</p>
                <button 
                  onClick={() => handleAnimatorSelect(participants[0])}
                  className="temp-button"
                >
                  Sélectionner nouvel animateur
                </button>
              </div>
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
              <div className="temp-history">
                <p>Historique des animateurs temporaire</p>
                <ul>
                  {animatorHistory.slice(0, 5).map((h: any, index: number) => (
                    <li key={index}>
                      {String(h.name || h.participant_name)} - {h.created_at ? new Date(h.created_at).toLocaleDateString() : 'Date inconnue'}
                    </li>
                  ))}
                </ul>
              </div>
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