import React, { useState, useCallback, useEffect } from 'react';
import { StandUpModal } from '../components/StandUpModal';
import { AnimatorSelectionModal } from '../components/AnimatorSelectionModal';
import { WeekPeriodDisplay } from '../components/WeekPeriodDisplay';
import { useParticipantSelection } from '../hooks/useParticipantSelection';
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useAnimators } from '../../hooks/useAnimators';
import { SupabaseParticipantRepository } from '../../infrastructure/persistence/supabase/participantRepository';
import { DailySelectionUseCases } from '../../application/daily/useCases';
import { WeeklySelectionUseCases } from '../../application/weekly/useCases';
import type { ParticipantRepository } from '../../domain/participant/repository';
import './Dashboard.css';

let participantRepository: ParticipantRepository;
let dailyUseCases: DailySelectionUseCases;
let weeklyUseCases: WeeklySelectionUseCases;

export const Dashboard: React.FC = () => {
  const [showStandUpModal, setShowStandUpModal] = useState(false);
  const [showAnimatorModal, setShowAnimatorModal] = useState(false);
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
  const { currentAnimator, animatorHistory } = useAnimators(
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

  // Fonction pour calculer le numéro de semaine
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  };

  // Fonction pour générer une couleur d'avatar basée sur le nom
  const getAvatarColor = (name?: string) => {
    if (!name) return { bg: '#4f7cff', text: '#ffffff' };
    
    const colors = [
      { bg: '#4f7cff', text: '#ffffff' }, // Bleu
      { bg: '#7c3aed', text: '#ffffff' }, // Violet
      { bg: '#06b6d4', text: '#ffffff' }, // Cyan
      { bg: '#10b981', text: '#ffffff' }, // Vert
      { bg: '#f59e0b', text: '#ffffff' }, // Orange
      { bg: '#ef4444', text: '#ffffff' }, // Rouge
      { bg: '#8b5cf6', text: '#ffffff' }, // Violet clair
      { bg: '#06d6a0', text: '#ffffff' }, // Turquoise
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Calculer les statistiques dynamiques
  const getAnimatorStats = () => {
    const totalParticipants = allParticipants?.length || 0;
    const participantsSpoken = allParticipants?.filter(p => 
      typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken
    )?.length || 0;
    const animatorPassages = currentAnimator?.getPassageCount() || 0;
    
    return {
      totalParticipants,
      participantsSpoken,
      animatorPassages,
      completionRate: totalParticipants > 0 ? Math.round((participantsSpoken / totalParticipants) * 100) : 0
    };
  };

  const stats = getAnimatorStats();
  
  const debugAnimator = currentAnimator || { 
    name: { value: 'Aucun animateur' }, 
    id: { value: 'no-animator' },
    getPhotoUrl: () => undefined,
    getPassageCount: () => 0
  };

  console.log('Dashboard Debug:', {
    isInitialized,
    currentAnimator,
    allParticipants: allParticipants?.length,
    dailyParticipants: dailyParticipants?.length,
    weeklyParticipants: weeklyParticipants?.length,
    isLoading,
    error,
    participantsWithStatus: allParticipants?.map(p => ({
      name: p.name?.value || p.name,
      hasSpoken: typeof p.hasSpoken === 'function' ? p.hasSpoken() : p.hasSpoken,
      hasSpokenType: typeof p.hasSpoken
    }))
  });

  // Affichage pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          {initError ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Erreur de connexion</h3>
              <p>{initError}</p>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                🔄 Réessayer
              </button>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <h3>Initialisation...</h3>
              <p>Connexion à la base de données</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h3>Une erreur est survenue</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header avec titre */}
        <header className="dashboard-header">
          <h1 className="dashboard-title">Stand-up Assistant</h1>
          <p className="dashboard-subtitle">Tableau de bord principal</p>
        </header>

        {/* Bloc principal avec animateur et période */}
        <div className="main-info-block">
          <div className="current-animator-section">
            <div className="animator-header">
              <h2>Animateur actuel</h2>
            </div>
            <div className="animator-card">
              {debugAnimator ? (
                <>
                  <div className="animator-avatar">
                    {debugAnimator?.getPhotoUrl && debugAnimator.getPhotoUrl() ? (
                      <img 
                        src={debugAnimator.getPhotoUrl()}
                        alt={String(debugAnimator.name?.value || debugAnimator.name || 'Animateur')}
                        className="animator-photo"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            const animatorName = String(debugAnimator.name?.value || debugAnimator.name || 'A');
                            const color = getAvatarColor(animatorName);
                            target.style.display = 'none';
                            parent.style.background = `linear-gradient(135deg, ${color.bg}, ${color.bg}dd)`;
                            parent.innerHTML = `<div class="avatar-fallback">${animatorName.charAt(0).toUpperCase()}</div>`;
                          }
                        }}
                      />
                    ) : (
                      <div 
                        className="avatar-fallback"
                        style={{
                          background: `linear-gradient(135deg, ${getAvatarColor(String(debugAnimator.name?.value || debugAnimator.name || 'A')).bg}, ${getAvatarColor(String(debugAnimator.name?.value || debugAnimator.name || 'A')).bg}dd)`,
                          color: 'white'
                        }}
                      >
                        {String(debugAnimator.name?.value || debugAnimator.name || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="animator-info">
                    <h3>{String(debugAnimator.name?.value || debugAnimator.name || 'Animateur')}</h3>
                    <p>En fonction cette semaine</p>
                    
                    <div className="animator-badges">
                      <div className="badge experience-badge">
                        <div className="badge-icon">🎯</div>
                        <div className="badge-content">
                          <span className="badge-label">A animé</span>
                          <span className="badge-value">{stats.animatorPassages} fois</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Éléments décoratifs animés */}
                  <div className="floating-elements">
                    <div className="floating-circle circle-1"></div>
                    <div className="floating-circle circle-2"></div>
                    <div className="floating-circle circle-3"></div>
                    <div className="floating-line line-1"></div>
                    <div className="floating-line line-2"></div>
                  </div>
                </>
              ) : (
                <div className="no-animator">
                  <div className="no-animator-icon">👤</div>
                  <div className="animator-info">
                    <h3>Aucun animateur</h3>
                    <p>Sélectionnez un animateur</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <WeekPeriodDisplay />
        </div>

        {/* Liste des speakers */}
                  <div className="speakers-section">
            <h2>Équipe</h2>
            <div className="speakers-grid">
            {allParticipants && allParticipants.length > 0 ? (
              allParticipants.slice(0, 8).map((participant) => {
              const participantName = String(participant.name?.value || participant.name || 'P');
              const avatarColor = getAvatarColor(participantName);
              const hasPhoto = 'getPhotoUrl' in participant && participant.getPhotoUrl && participant.getPhotoUrl();
              
              return (
                <div key={String(participant.id?.value || participant.id)} className="speaker-card">
                  {hasPhoto ? (
                    <img 
                      src={'getPhotoUrl' in participant ? participant.getPhotoUrl() : ''}
                      alt={participantName}
                      className="speaker-avatar"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'speaker-avatar-fallback';
                          fallbackDiv.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                          fallbackDiv.style.color = avatarColor.text;
                          fallbackDiv.textContent = participantName.charAt(0).toUpperCase();
                          parent.insertBefore(fallbackDiv, target);
                        }
                      }}
                    />
                  ) : (
                    <div 
                      className="speaker-avatar-fallback"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`,
                        color: avatarColor.text
                      }}
                    >
                      {participantName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="speaker-name">{participantName}</span>
                  {(typeof participant.hasSpoken === 'function' ? participant.hasSpoken() : participant.hasSpoken) && (
                    <div className="speaker-status">✅</div>
                  )}
                </div>
                              );
              })
            ) : (
              <div className="no-participants">
                <div className="no-participants-icon">👥</div>
                <p>Aucun participant disponible</p>
                <p className="no-participants-hint">Les participants apparaîtront ici une fois l'application connectée.</p>
              </div>
            )}
            {(allParticipants?.length || 0) > 8 && (
              <div className="speaker-card more-speakers">
                <div className="more-count">
                  +{(allParticipants?.length || 0) - 8}
                </div>
                <span className="speaker-name">autres</span>
              </div>
            )}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="action-buttons">
          <button 
            className="action-button primary"
            onClick={() => setShowStandUpModal(true)}
            disabled={isLoading}
          >
            <div className="button-icon">🎯</div>
            <div className="button-content">
              <span className="button-title">Démarrer Stand-up</span>
              <span className="button-subtitle">Sélectionner les speakers</span>
            </div>
          </button>

          <button 
            className="action-button secondary"
            onClick={() => setShowAnimatorModal(true)}
            disabled={isLoading}
          >
            <div className="button-icon">👑</div>
            <div className="button-content">
              <span className="button-title">Sélectionner l'animateur</span>
              <span className="button-subtitle">Pour la semaine prochaine</span>
            </div>
          </button>
        </div>
      </div>

      {/* Modales */}
      {showStandUpModal && (
        <StandUpModal
          isOpen={showStandUpModal}
          onClose={() => setShowStandUpModal(false)}
          participants={dailyParticipants}
          allParticipants={allParticipants}
          onSelect={handleSelection}
          onReset={resetParticipants}
          repository={participantRepository}
          dailyUseCases={dailyUseCases}
          currentAnimator={currentAnimator}
        />
      )}

      {showAnimatorModal && (
        <AnimatorSelectionModal
          isOpen={showAnimatorModal}
          onClose={() => setShowAnimatorModal(false)}
          participants={weeklyParticipants}
          onSelect={(participant: any) => {
            // Logique de sélection d'animateur
            console.log('Animateur sélectionné:', participant);
            setShowAnimatorModal(false);
          }}
          repository={participantRepository}
          weeklyUseCases={weeklyUseCases}
          currentAnimator={currentAnimator}
        />
      )}
    </div>
  );
}; 