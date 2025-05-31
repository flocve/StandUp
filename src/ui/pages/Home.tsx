import React, { useState, useEffect, useCallback } from 'react';
import { SelectionWheel } from '../components/SelectionWheel';
import { ParticipantRanking } from '../components/ParticipantRanking';
import { PityCounterEditor } from '../components/PityCounterEditor';
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
  const [selectionType, setSelectionType] = useState<SelectionType>('daily');

  const {
    participants,
    allParticipants,
    isLoading,
    error,
    handleSelection,
    resetParticipants,
    loadParticipants,
  } = useParticipantSelection({
    type: selectionType,
    dailyUseCases,
    weeklyUseCases,
  });

  const handlePityCounterUpdate = async (participantId: string, newValue: number) => {
    await participantRepository.updatePityCounter(participantId, newValue);
    // Recharger les participants pour mettre à jour l'affichage
    await loadParticipants();
  };

  const handleTabChange = async (type: SelectionType) => {
    setSelectionType(type);
  };

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error">Une erreur est survenue: {error.message}</div>;
  }

  return (
    <div className="home">
      <header className="header">
        <h1>Stand-up Meeting Assistant</h1>
        <div className="tab-container">
          <button
            className={`tab ${selectionType === 'daily' ? 'active' : ''}`}
            onClick={() => handleTabChange('daily')}
          >
            Daily Stand-up
          </button>
          <button
            className={`tab ${selectionType === 'weekly' ? 'active' : ''}`}
            onClick={() => handleTabChange('weekly')}
          >
            Sélection Animateur
          </button>
        </div>
      </header>

      <main className="main">
        <div className="content">
          <SelectionWheel
            participants={participants}
            onSelect={handleSelection}
            type={selectionType}
            onUpdatePityCounter={selectionType === 'weekly' ? handlePityCounterUpdate : undefined}
            allParticipants={allParticipants as DailyParticipant[] | undefined}
            repository={participantRepository}
            weeklyUseCases={selectionType === 'weekly' ? weeklyUseCases : undefined}
            onReloadData={selectionType === 'weekly' ? loadParticipants : undefined}
          />
          {selectionType === 'daily' && allParticipants && (
            <ParticipantRanking
              participants={allParticipants as DailyParticipant[]}
              onReset={resetParticipants}
            />
          )}
          {selectionType === 'weekly' && (
            <>
              <PityCounterEditor
                participants={participants}
                onUpdatePityCounter={handlePityCounterUpdate}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}; 