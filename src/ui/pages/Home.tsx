import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SelectionWheel } from '../components/SelectionWheel';
import { ParticipantRanking } from '../components/ParticipantRanking';
import { AnimatorHistory } from '../components/AnimatorHistory';
import { CurrentAnimator } from '../components/CurrentAnimator';
import { useParticipantSelection } from '../hooks/useParticipantSelection';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useAnimators } from '../../hooks/useAnimators';
import { SupabaseParticipantRepository } from '../../infrastructure/persistence/supabase/participantRepository';
import { DailySelectionUseCases } from '../../application/daily/useCases';
import { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import { DATABASE_CONFIG } from '../../config/database';
import '../../../src/scripts/testSupabase'; // Import pour devtools
import '../../infrastructure/persistence/supabase/utils'; // Import utils Supabase pour console
import type { SelectionType } from '../../domain/selection/service';
import type { DailyParticipant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import './Home.css';

// Initialisation des dépendances
let participantRepository: ParticipantRepository;
let dailyUseCases: DailySelectionUseCases;
let weeklyUseCases: WeeklySelectionUseCases;

export const Home: React.FC = () => {
  const [selectionType, setSelectionType] = useState<SelectionType>('daily');
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [allWeeklyParticipants, setAllWeeklyParticipants] = useState<any[]>([]);

  // Mises à jour granulaires via la synchronisation temps réel
  const handleWeeklyParticipantChange = useCallback((payload?: any) => {
    if (payload?.new && payload?.eventType !== 'DELETE') {
      // Mise à jour granulaire d'un participant spécifique
      updateSpecificParticipant(payload.new.id, {
        chance_percentage: payload.new.chance_percentage,
        passage_count: payload.new.passage_count
      });
    } else {
      // Fallback : rechargement complet seulement en cas de suppression ou données manquantes
      loadParticipants();
    }
  }, []);

  const handleDailyParticipantChange = useCallback((payload?: any) => {
    if (payload?.new && payload?.eventType !== 'DELETE') {
      // Mise à jour granulaire d'un participant spécifique
      updateSpecificParticipant(payload.new.id, {
        has_spoken: payload.new.has_spoken,
        last_participation: payload.new.last_participation
      });
    } else {
      // Fallback : rechargement complet
      loadParticipants();
    }
  }, []);

  const handleAnimatorHistoryChange = useCallback((payload?: any) => {
    // Pour l'historique, on peut se contenter d'un log ou d'une notification
    // Le changement important (increment des compteurs) sera géré par handleWeeklyParticipantChange
    if (payload?.new) {
    }
  }, []);

  const {
    participants,
    allParticipants,
    isLoading,
    error,
    handleSelection,
    resetParticipants,
    loadParticipants,
    updateSpecificParticipant
  } = useParticipantSelection({
    type: selectionType,
    dailyUseCases: isInitialized ? dailyUseCases : undefined,
    weeklyUseCases: isInitialized ? weeklyUseCases : undefined,
  });

  // Synchronisation temps réel (Supabase uniquement)
  const { isRealtimeEnabled, forceSync } = useRealtimeSync({
    onWeeklyParticipantsChange: handleWeeklyParticipantChange,
    onDailyParticipantsChange: handleDailyParticipantChange,
    onAnimatorHistoryChange: handleAnimatorHistoryChange,
    enabled: isInitialized
  });

  // Hook pour gérer l'animateur courant (seulement si initialisé)
  // On utilise tous les participants weekly qui ne changent pas selon l'onglet
  const { lastAnimator, animatorHistory } = useAnimators(
    allWeeklyParticipants, 
    isInitialized ? participantRepository as any : { getAnimatorHistory: async () => [], addToAnimatorHistory: async () => {} }
  );

  // Initialiser la base de données
  useEffect(() => {
    const initializeRepository = async () => {
      try {
        participantRepository = new SupabaseParticipantRepository();

        // Initialiser si la méthode existe
        if ('initialize' in participantRepository) {
          await (participantRepository as any).initialize();
        }
        
        dailyUseCases = new DailySelectionUseCases(participantRepository);
        weeklyUseCases = new WeeklySelectionUseCases(participantRepository);

        // Charger tous les participants weekly pour l'historique des animateurs
        const weeklyParticipants = await participantRepository.getAllWeeklyParticipants();
        setAllWeeklyParticipants(weeklyParticipants);

        setIsInitialized(true);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation Supabase:', error);
        setInitError(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    };

    initializeRepository();

    // Nettoyage lors du démontage du composant
    return () => {
      if (participantRepository && 'cleanup' in participantRepository) {
        (participantRepository as any).cleanup().catch(console.error);
      }
    };
  }, []);

  const handleChancePercentageUpdate = async (participantId: string, newValue: number) => {
    if (!isInitialized) return;
    
    await participantRepository.updateChancePercentage(participantId, newValue);
    // Recharger en arrière-plan sans écran de chargement
    await loadParticipants(false);
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
                ❌ Erreur de chargement Supabase
              </div>
              <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {initError}
              </div>
              <div style={{ color: '#6b7280', marginBottom: '1rem' }}>
                🌐 Vérifiez votre connexion internet et la configuration Supabase
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
                🔄 Initialisation de Supabase...
              </div>
              <div style={{ color: '#6b7280' }}>
                Connexion à la base de données partagée
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
      {/* Affichage de l'animateur courant en haut à gauche - seulement dans l'onglet Daily */}
      {selectionType === 'daily' && <CurrentAnimator currentAnimator={lastAnimator} />}
      
      <div className="content-wrapper">
        <header className="header">
          <h1>Stand-up Meeting Assistant</h1>
          <p className="subtitle">Organisez vos réunions quotidiennes et sélectionnez vos animateurs</p>
          <div className="tab-container">
            <button
              className={`tab ${selectionType === 'daily' ? 'active' : ''}`}
              onClick={() => handleTabChange('daily')}
            >
              <span className="tab-icon">📅</span>
              Daily Stand-up
            </button>
            <button
              className={`tab ${selectionType === 'weekly' ? 'active' : ''}`}
              onClick={() => handleTabChange('weekly')}
            >
              <span className="tab-icon">👑</span>
              Sélection Animateur
            </button>
          </div>
        </header>

        <main className="main">
          <div className="main-content">
            {/* Zone centrale - Sélection */}
            <div className="selection-area">
              <SelectionWheel
                participants={participants}
                onSelect={handleSelection}
                type={selectionType}
                onUpdateChancePercentage={selectionType === 'weekly' ? handleChancePercentageUpdate : undefined}
                allParticipants={allParticipants as DailyParticipant[] | undefined}
                repository={participantRepository}
                weeklyUseCases={selectionType === 'weekly' ? weeklyUseCases : undefined}
                dailyUseCases={selectionType === 'daily' ? dailyUseCases : undefined}
                currentAnimator={lastAnimator}
              />
            </div>

            {/* Zone pour le daily ranking si nécessaire */}
            {selectionType === 'daily' && allParticipants && (
              <div className="daily-ranking-area">
                <ParticipantRanking
                  participants={allParticipants as DailyParticipant[]}
                  onReset={resetParticipants}
                />
              </div>
            )}
          </div>
        </main>

        {/* Bloc fixe à gauche - Nos derniers animateurs */}
        {selectionType === 'weekly' && animatorHistory.length > 0 && (
          <div className="fixed-left-panel">
            <AnimatorHistory history={animatorHistory} />
          </div>
        )}


      </div>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Développé par Florian Chauviere</p>
      </footer>
    </div>
  );
}; 