import React, { useState, useEffect } from 'react';
import { SelectionWheel } from '../components/SelectionWheel';
import { ParticipantRanking } from '../components/ParticipantRanking';
import { useParticipantSelection } from '../hooks/useParticipantSelection';
import { LocalStorageParticipantRepository } from '../../infrastructure/persistence/localStorage/participantRepository';
import { DailySelectionUseCases } from '../../application/daily/useCases';
import { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import type { SelectionType } from '../../domain/selection/service';
import type { DailyParticipant } from '../../domain/participant/entities';
import './Home.css';

// Initialisation des dépendances
const participantRepository = new LocalStorageParticipantRepository();
const dailyUseCases = new DailySelectionUseCases(participantRepository);
const weeklyUseCases = new WeeklySelectionUseCases(participantRepository);

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SelectionType>('daily');
  const [isThursday, setIsThursday] = useState(false);

  const {
    participants,
    allParticipants,
    isLoading,
    error,
    handleSelection,
    resetParticipants
  } = useParticipantSelection({
    type: activeTab,
    dailyUseCases,
    weeklyUseCases
  });

  // Vérifier si c'est jeudi
  useEffect(() => {
    const today = new Date();
    setIsThursday(today.getDay() === 4);
  }, []);

  // Réinitialiser les participants quotidiens à minuit
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetParticipants();
      }
    };

    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, [resetParticipants]);

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser l\'ordre de passage ?')) {
      resetParticipants();
    }
  };

  if (error) {
    return (
      <div className="error-state">
        <h3 className="error-title">Une erreur est survenue</h3>
        <p className="error-message">{error.message}</p>
        <button onClick={() => window.location.reload()} className="error-button">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            🎲 Tour de parole
          </button>
          <button 
            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            🎯 Sélection de l'animateur
          </button>
        </div>

        <h1 className="title">
          {activeTab === 'daily' ? 'Tour de parole' : 'Sélection de l\'animateur'}
        </h1>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">Chargement...</p>
          </div>
        ) : (
          <SelectionWheel
            participants={participants}
            activeParticipants={activeTab === 'daily' && allParticipants 
              ? (() => {
                  // Récupérer les participants qui ont déjà parlé, triés par date de participation
                  const spokenParticipants = allParticipants
                    .filter(p => p.hasSpoken())
                    .sort((a, b) => {
                      const dateA = a.getLastParticipation()?.getTime() || 0;
                      const dateB = b.getLastParticipation()?.getTime() || 0;
                      return dateB - dateA;  // Le plus récent en premier
                    });
                  return spokenParticipants.length > 0 ? [spokenParticipants[0]] : [];
                })()
              : []}
            onSelect={handleSelection}
            type={activeTab}
          />
        )}
      </div>

      {activeTab === 'daily' && allParticipants && (
        <ParticipantRanking 
          participants={allParticipants}
          onReset={handleReset}
        />
      )}
    </div>
  );
}; 