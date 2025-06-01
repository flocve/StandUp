import React, { useState, useCallback, useEffect } from 'react';
import { SelectionWheel } from '../components/SelectionWheel';
import { ParticipantRanking } from '../components/ParticipantRanking';
import { ChancePercentageEditor } from '../components/ChancePercentageEditor';
import { Configuration } from './Configuration';
import { useParticipantSelection } from '../hooks/useParticipantSelection';
import { SQLiteParticipantRepository } from '../../infrastructure/persistence/sqlite';
import { DailySelectionUseCases } from '../../application/daily/useCases';
import { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import type { SelectionType } from '../../domain/selection/service';
import type { DailyParticipant } from '../../domain/participant/entities';
import './Home.css';

// Initialisation des dépendances
let participantRepository: SQLiteParticipantRepository;
let dailyUseCases: DailySelectionUseCases;
let weeklyUseCases: WeeklySelectionUseCases;

export const Home: React.FC = () => {
  const [selectionType, setSelectionType] = useState<SelectionType>('daily');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(false);

  // Initialiser SQLite
  useEffect(() => {
    const initializeRepository = async () => {
      try {
        participantRepository = new SQLiteParticipantRepository();
        await participantRepository.initialize();
        
        dailyUseCases = new DailySelectionUseCases(participantRepository);
        weeklyUseCases = new WeeklySelectionUseCases(participantRepository);

        setIsInitialized(true);
        console.log('✅ SQLite initialisé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation SQLite:', error);
        setInitError(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    };

    initializeRepository();

    // Nettoyage lors du démontage du composant
    return () => {
      if (participantRepository) {
        participantRepository.cleanup().catch(console.error);
      }
    };
  }, []);

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
    dailyUseCases: isInitialized ? dailyUseCases : undefined,
    weeklyUseCases: isInitialized ? weeklyUseCases : undefined,
  });

  const handleChancePercentageUpdate = async (participantId: string, newValue: number) => {
    if (!isInitialized) return;
    
    await participantRepository.updateChancePercentage(participantId, newValue);
    // Recharger les participants pour mettre à jour l'affichage
    await loadParticipants();
  };

  const handleTabChange = async (type: SelectionType) => {
    setSelectionType(type);
  };

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          {initError ? (
            <div>
              <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.2rem' }}>
                ❌ Erreur de chargement SQLite
              </div>
              <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {initError}
              </div>
              <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
                🌐 Vérifiez votre connexion internet
              </div>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                🔄 Recharger la page
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                🔄 Chargement de sql.js depuis le CDN...
              </div>
              <div style={{ color: '#6b7280' }}>
                Initialisation de la base de données SQLite
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          🗄️ Base de données SQLite
        </div>
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
            onUpdateChancePercentage={selectionType === 'weekly' ? handleChancePercentageUpdate : undefined}
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
              <ChancePercentageEditor
                participants={participants}
                onUpdateChancePercentage={handleChancePercentageUpdate}
              />
            </>
          )}
        </div>
      </main>

      {/* Bouton de configuration flottant */}
      <button 
        className="config-btn" 
        onClick={() => setShowConfiguration(true)}
        title="Configuration & Base de données"
      >
        ⚙️
      </button>

      {/* Modal de configuration */}
      {showConfiguration && (
        <Configuration onClose={() => setShowConfiguration(false)} />
      )}
    </div>
  );
}; 