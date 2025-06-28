import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { StandUpModal } from '../components/StandUpModal';
import { AnimatorSelectionModal } from '../components/AnimatorSelectionModal';
import { TeamConfigModal } from '../components/TeamConfigModal';
import { WeekPeriodDisplay } from '../components/WeekPeriodDisplay';
import { RetroCountdown } from '../components/RetroCountdown';
import { useParticipantSelection } from '../hooks/useParticipantSelection';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useAnimators } from '../../hooks/useAnimators';
import { SupabaseParticipantRepository } from '../../infrastructure/persistence/supabase/participantRepository';
import { DailySelectionUseCases } from '../../application/daily/useCases';
import { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import type { ParticipantRepository } from '../../domain/participant/repository';
import { useTheme } from '../../contexts/ThemeContext';
import {
  DashboardHeader,
  CurrentAnimatorBlock,
  TeamSection,
  ActionButtons
} from '../components/Dashboard';

let participantRepository: ParticipantRepository;
let dailyUseCases: DailySelectionUseCases;
let weeklyUseCases: WeeklySelectionUseCases;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: transparent;
  position: relative;
  z-index: 1;
`;

const DashboardContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MainInfoBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TeamRetroSection = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1.2fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
`;

const LoadingContent = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(79, 124, 255, 0.3);
  border-top: 3px solid #4f7cff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorContent = styled.div`
  text-align: center;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.2);
  border-radius: 16px;
  color: #ef4444;
`;

const RetryButton = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-2px);
  }
`;

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const [showStandUpModal, setShowStandUpModal] = useState(false);
  const [showAnimatorModal, setShowAnimatorModal] = useState(false);
  const [showTeamConfigModal, setShowTeamConfigModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [allWeeklyParticipants, setAllWeeklyParticipants] = useState<any[]>([]);

  // Handlers pour les mises à jour temps réel
  const handleWeeklyParticipantChange = useCallback((payload?: any) => {
    if (payload?.new && payload?.eventType !== 'DELETE') {
      updateSpecificParticipant(payload.new.id, {
        chance_percentage: payload.new.chance_percentage,
        passage_count: payload.new.passage_count
      });
    } else {
      loadParticipants();
    }
  }, []);

  const handleDailyParticipantChange = useCallback((payload?: any) => {
    if (payload?.new && payload?.eventType !== 'DELETE') {
      updateSpecificParticipant(payload.new.id, {
        has_spoken: payload.new.has_spoken,
        last_participation: payload.new.last_participation
      });
    } else {
      loadParticipants();
    }
  }, []);

  const handleAnimatorHistoryChange = useCallback((payload?: any) => {
    // Géré par handleWeeklyParticipantChange
  }, []);

  // Hooks pour la gestion des participants
  const {
    participants: dailyParticipants,
    allParticipants,
    isLoading,
    error,
    handleSelection,
    resetParticipants,
    loadParticipants,
    updateSpecificParticipant
  } = useParticipantSelection({
    type: 'daily',
    dailyUseCases: isInitialized ? dailyUseCases : undefined,
    weeklyUseCases: isInitialized ? weeklyUseCases : undefined,
  });

  const {
    participants: weeklyParticipants
  } = useParticipantSelection({
    type: 'weekly',
    dailyUseCases: isInitialized ? dailyUseCases : undefined,
    weeklyUseCases: isInitialized ? weeklyUseCases : undefined,
  });

  // Synchronisation temps réel
  const { isRealtimeEnabled, forceSync } = useRealtimeSync({
    onWeeklyParticipantsChange: handleWeeklyParticipantChange,
    onDailyParticipantsChange: handleDailyParticipantChange,
    onAnimatorHistoryChange: handleAnimatorHistoryChange,
    enabled: isInitialized
  });

  // Hook pour gérer l'animateur courant
  const {
    getCurrentWeekAnimator,
    getNextWeekAnimator
  } = useAnimators(
    allWeeklyParticipants, 
    isInitialized ? participantRepository as any : { getAnimatorHistory: async () => [], addToAnimatorHistory: async () => {} }
  );

  // Initialisation
  useEffect(() => {
    const initializeRepository = async () => {
      try {
        participantRepository = new SupabaseParticipantRepository();

        if ('initialize' in participantRepository) {
          await (participantRepository as any).initialize();
        }
        
        dailyUseCases = new DailySelectionUseCases(participantRepository);
        weeklyUseCases = new WeeklySelectionUseCases(participantRepository);

        const weeklyParticipants = await participantRepository.getAllWeeklyParticipants();
        setAllWeeklyParticipants(weeklyParticipants);

        setIsInitialized(true);
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        setInitError(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    };

    initializeRepository();

    return () => {
      if (participantRepository && 'cleanup' in participantRepository) {
        (participantRepository as any).cleanup().catch(console.error);
      }
    };
  }, []);



  // Calculer les statistiques dynamiques
  const getAnimatorStats = (participants: any[]) => {
    const totalParticipants = participants.length;
    const animatorPassages = getCurrentWeekAnimator()?.participant?.getPassageCount() || 0;
    const participantsSpoken = participants.filter(p => 
      typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
    ).length;
    return {
      totalParticipants,
      participantsSpoken,
      animatorPassages,
      completionRate: totalParticipants > 0 ? Math.round((participantsSpoken / totalParticipants) * 100) : 0
    };
  };

  const stats = getAnimatorStats(allParticipants || []);
  
  const currentWeekEntry = getCurrentWeekAnimator();
  const nextWeekEntry = getNextWeekAnimator();

  const currentAnimator = currentWeekEntry?.participant || { 
    name: { value: 'Aucun animateur' }, 
    id: { value: 'no-animator' },
    getPhotoUrl: () => undefined,
    getPassageCount: () => 0
  };

  const nextAnimator = nextWeekEntry?.participant;

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <LoadingContainer>
        <LoadingContent>
          {initError ? (
            <ErrorContent>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
              <h3>Erreur de connexion</h3>
              <p>{initError}</p>
              <RetryButton onClick={() => window.location.reload()}>
                🔄 Réessayer
              </RetryButton>
            </ErrorContent>
          ) : (
            <>
              <LoadingSpinner />
              <h3>Initialisation...</h3>
              <p>Connexion à la base de données</p>
            </>
          )}
        </LoadingContent>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorContent>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <h3>Une erreur est survenue</h3>
          <p>{error.message}</p>
        </ErrorContent>
      </ErrorContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        {/* Header avec titre */}
        <DashboardHeader />

        {/* Bloc principal avec animateur et période */}
        <MainInfoBlock>
          <CurrentAnimatorBlock
            currentAnimator={currentAnimator?.name?.value !== 'Aucun animateur' ? currentAnimator : null}
            nextAnimator={nextAnimator}
            passageCount={stats.animatorPassages}
          />
          <WeekPeriodDisplay />
        </MainInfoBlock>

        {/* Section équipe et rétro */}
        <TeamRetroSection>
          <TeamSection
            participants={allWeeklyParticipants || []}
            currentAnimator={currentAnimator?.name?.value !== 'Aucun animateur' ? currentAnimator : null}
            nextAnimator={nextAnimator}
            onTeamConfigClick={() => setShowTeamConfigModal(true)}
          />
          <RetroCountdown />
        </TeamRetroSection>

        {/* Boutons d'action */}
        <ActionButtons
          onStartStandUp={() => setShowStandUpModal(true)}
          onSelectAnimator={() => setShowAnimatorModal(true)}
          isLoading={isLoading}
          hasNextWeekAnimator={Boolean(nextWeekEntry && nextWeekEntry.participant)}
        />
      </DashboardContent>

      {/* Modales */}
      {showStandUpModal && (
        <StandUpModal
          isOpen={showStandUpModal}
          onClose={() => setShowStandUpModal(false)}
          participants={dailyParticipants}
          allParticipants={allParticipants}
          allWeeklyParticipants={allWeeklyParticipants}
          onSelect={handleSelection}
          onReset={resetParticipants}
          repository={participantRepository}
          dailyUseCases={dailyUseCases}
          currentAnimator={currentAnimator}
          theme={theme}
        />
      )}

      {showAnimatorModal && (
        <AnimatorSelectionModal
          isOpen={showAnimatorModal}
          onClose={() => setShowAnimatorModal(false)}
          participants={weeklyParticipants}
          onSelect={(participant: any) => {}}
          repository={participantRepository}
          weeklyUseCases={weeklyUseCases}
          currentAnimator={currentAnimator}
          nextWeekAnimator={nextWeekEntry}
          theme={theme}
        />
      )}

      {showTeamConfigModal && (
        <TeamConfigModal
          isOpen={showTeamConfigModal}
          onClose={() => setShowTeamConfigModal(false)}
          repository={participantRepository}
          onRefresh={() => {
            loadParticipants();
            const loadWeeklyParticipants = async () => {
              try {
                const weeklyParticipants = await participantRepository.getAllWeeklyParticipants();
                setAllWeeklyParticipants(weeklyParticipants);
              } catch (error) {
                console.error('Erreur lors du rechargement des participants:', error);
              }
            };
            loadWeeklyParticipants();
          }}
        />
      )}
    </DashboardContainer>
  );
};