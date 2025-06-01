import React, { useState, useCallback, useEffect } from 'react';
import { SelectionWheel } from '../components/SelectionWheel';
import { ParticipantRanking } from '../components/ParticipantRanking';
import { ChancePercentageEditor } from '../components/ChancePercentageEditor';
import { Configuration } from './Configuration';
import { useParticipantSelection } from '../hooks/useParticipantSelection';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
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
  const [showConfiguration, setShowConfiguration] = useState(false);

  // Fonction pour forcer le rechargement des données
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Rechargement forcé des données depuis synchronisation temps réel');
    // La fonction loadParticipants sera définie après l'appel du hook useParticipantSelection
  }, []);

  // Synchronisation temps réel (Supabase uniquement)
  const { isRealtimeEnabled, forceSync } = useRealtimeSync({
    onWeeklyParticipantsChange: () => {
      console.log('📊 Changement participants hebdomadaires détecté');
      forceRefresh();
    },
    onDailyParticipantsChange: () => {
      console.log('📅 Changement participants quotidiens détecté');
      forceRefresh();
    },
    onAnimatorHistoryChange: () => {
      console.log('📜 Changement historique animateurs détecté');
      forceRefresh();
    },
    enabled: isInitialized
  });

  // Initialiser la base de données
  useEffect(() => {
    const initializeRepository = async () => {
      try {
        console.log('🌐 Utilisation de Supabase (base partagée)');
        participantRepository = new SupabaseParticipantRepository();

        // Initialiser si la méthode existe
        if ('initialize' in participantRepository) {
          await (participantRepository as any).initialize();
        }
        
        dailyUseCases = new DailySelectionUseCases(participantRepository);
        weeklyUseCases = new WeeklySelectionUseCases(participantRepository);

        setIsInitialized(true);
        console.log('✅ Supabase initialisé avec succès');
        
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

  // Connecter la synchronisation temps réel avec le rechargement des données
  useEffect(() => {
    const realtimeRefresh = async () => {
      if (loadParticipants) {
        await loadParticipants();
      }
    };
    
    // Remplacer la fonction forceRefresh pour utiliser loadParticipants
    Object.defineProperty(forceRefresh, 'name', { value: 'realtimeRefresh' });
    Object.assign(forceRefresh, realtimeRefresh);
  }, [loadParticipants]);

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
      <header className="header">
        <h1>Stand-up Meeting Assistant</h1>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
          <span>🌐 Supabase (Base partagée)</span>
          {isRealtimeEnabled && (
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ animation: 'pulse 2s infinite' }}>🔄</span>
              Temps réel actif
            </span>
          )}
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