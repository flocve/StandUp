import React, { useState, useCallback, useEffect } from 'react';
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
import { getParticipantPhotoUrlWithTheme } from '../../utils/animalPhotos';
import { useTheme } from '../../contexts/ThemeContext';
import './Dashboard.css';

let participantRepository: ParticipantRepository;
let dailyUseCases: DailySelectionUseCases;
let weeklyUseCases: WeeklySelectionUseCases;

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

  // Fonction helper pour obtenir l'URL de photo avec support du thème
  const getPhotoUrl = (participant: any) => {
    const participantName = getNameString(participant);
    const customPhotoUrl = participant?.getPhotoUrl?.();
    return getParticipantPhotoUrlWithTheme(participantName, customPhotoUrl, theme);
  };

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

  // Utilitaire pour obtenir le nom sous forme de string
  const getNameString = (participantOrName: any) => {
    if (!participantOrName) return '';
    if (typeof participantOrName === 'string') return participantOrName;
    if (typeof participantOrName.name === 'object' && 'value' in participantOrName.name) return participantOrName.name.value;
    if (typeof participantOrName.value === 'string') return participantOrName.value;
    if (typeof participantOrName.name === 'string') return participantOrName.name;
    return '';
  };



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
            <div className="block-header">
            <div className="block-header-left">

              <span className="block-emoji" style={{ paddingBottom: '10px' }}>👑</span>
              <h2 className="block-title">Animateur actuel</h2>
              </div>
            </div>
            <div className="animator-card" style={{ position: 'relative' }}>
              {currentAnimator ? (
                <>
                  <div className="animator-avatar">
                    <img 
                      src={getPhotoUrl(currentAnimator)}
                      alt={getNameString(currentAnimator) || 'Animateur'}
                      className="animator-photo"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          const animatorName = getNameString(currentAnimator);
                          const color = getAvatarColor(animatorName);
                          target.style.display = 'none';
                          parent.style.background = `linear-gradient(135deg, ${color.bg}, ${color.bg}dd)`;
                          parent.innerHTML = `<div class=\"avatar-fallback\">${animatorName.charAt(0).toUpperCase()}</div>`;
                        }
                      }}
                    />
                  </div>
                  <div className="animator-info" style={{ textAlign: 'left', flex: 1 }}>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 0.3rem 0', letterSpacing: '-0.01em' }}>{getNameString(currentAnimator) || 'Animateur'}</h3>
                    <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', margin: 0, opacity: 0.85, fontWeight: 500 }}>En fonction cette semaine</p>
                    <div className="animator-badges" style={{ marginTop: '0.7rem', display: 'flex', justifyContent: 'center' }}>
                      <div className="badge experience-badge">
                        <div className="badge-icon">🎯</div>
                        <div className="badge-content">
                          <span className="badge-label">A animé</span>
                          <span className="badge-value">{stats.animatorPassages} fois</span>
                        </div>
                      </div>
                    </div>
                  </div>
              
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
            {nextWeekEntry && nextWeekEntry.participant && (
                    <div className="next-animator-discreet" style={{ position: 'absolute', bottom: '1.2rem', right: '1.2rem', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', background: 'rgba(0,0,0,0.08)', borderRadius: '1.2rem', padding: '0.3rem 0.7rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: `linear-gradient(135deg, ${getAvatarColor(getNameString(nextWeekEntry.participant)).bg}, ${getAvatarColor(getNameString(nextWeekEntry.participant)).bg}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
                        <img 
                          src={getPhotoUrl(nextWeekEntry.participant)} 
                          alt={getNameString(nextWeekEntry.participant)} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.innerHTML = getNameString(nextWeekEntry.participant).charAt(0).toUpperCase();
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.93rem', opacity: 0.8 }}>Prochain animateur</div>
                        <div style={{ fontWeight: 700 }}>{getNameString(nextWeekEntry.participant)}</div>
                      </div>
                    </div>
                  )}
          </div>

          <WeekPeriodDisplay />
        </div>

        {/* Section équipe et rétro */}
        <div className="team-retro-section">
          {/* Liste des speakers */}
          <div className="speakers-section">
            <div className="block-header">
              <div className="block-header-left">
                <span className="block-emoji" style={{ paddingBottom: '10px' }}>👥</span>
                <h2 className="block-title">Équipe</h2>
              </div>
              <button 
                className="team-config-button"
                onClick={() => setShowTeamConfigModal(true)}
                title="Configurer l'équipe"
              >
                ⚙️
              </button>
            </div>
            <div className="speakers-grid">
            {(allWeeklyParticipants || []).length > 0 ? (
              (allWeeklyParticipants || []).slice(0, 8).map((participant) => {
              const participantName = getNameString(participant);
              const avatarColor = getAvatarColor(participantName);
              const isCurrentAnimator = currentAnimator && getNameString(currentAnimator) === participantName;
              const isNextAnimator = nextWeekEntry && nextWeekEntry.participant && getNameString(nextWeekEntry.participant) === participantName;
              
              let cardClass = 'speaker-card';
              if (isCurrentAnimator) cardClass += ' current-animator';
              if (isNextAnimator) cardClass += ' next-animator';
              
              return (
                <div key={String(participant.id?.value || participant.id)} className={cardClass}>
                  <div className="speaker-avatar-container">
                    {isCurrentAnimator && <div className="speaker-crown">👑</div>}
                    {isNextAnimator && !isCurrentAnimator && <div className="speaker-silver-crown">👑</div>}
                    <img 
                      src={getPhotoUrl(participant)}
                      alt={participantName}
                      className="speaker-avatar"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement?.parentElement; // On remonte de 2 niveaux maintenant
                        if (parent) {
                          target.style.display = 'none';
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'speaker-avatar-fallback';
                          fallbackDiv.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                          fallbackDiv.style.color = avatarColor.text;
                          fallbackDiv.textContent = participantName.charAt(0).toUpperCase();
                          target.parentElement?.insertBefore(fallbackDiv, target);
                        }
                      }}
                    />
                  </div>
                  <div className="speaker-info">
                    <span className="speaker-name">{participantName}</span>
                    {/* Badge discret pour le nombre de passages */}
                    {'getPassageCount' in participant && participant.getPassageCount() > 0 && (
                      <div className="speaker-passage-badge">
                        <span 
                          className="speaker-passage-count"
                          data-count={participant.getPassageCount()}
                        >
                          {participant.getPassageCount()}
                        </span>
                      </div>
                    )}
                  </div>
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
            {((allWeeklyParticipants || []).length || 0) > 8 && (
              <div className="speaker-card more-speakers">
                <div className="more-count">
                  +{((allWeeklyParticipants || []).length || 0) - 8}
                </div>
                <span className="speaker-name">autres</span>
              </div>
            )}
          </div>
        </div>

          <RetroCountdown />
        </div>

        {/* Boutons d'action */}
        <div className="action-buttons">
          {(() => {
            // Vérifier si on est jeudi (4) ou vendredi (5)
            const today = new Date();
            const dayOfWeek = today.getDay();
            const isThursdayOrFriday = dayOfWeek === 4 || dayOfWeek === 5;
            const hasNextWeekAnimator = nextWeekEntry && nextWeekEntry.participant;
            
            return (
              <>
                <button 
                  className={`action-button ${isThursdayOrFriday && !hasNextWeekAnimator ? 'primary highlighted' : 'primary'}`}
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
                  className={`action-button ${isThursdayOrFriday && !hasNextWeekAnimator ? 'secondary highlighted-urgent' : 'secondary'}`}
                  onClick={() => setShowAnimatorModal(true)}
                  disabled={isLoading || Boolean(hasNextWeekAnimator)}
                >
                  <div className="button-icon">👑</div>
                  <div className="button-content">
                    <span className="button-title">
                      {hasNextWeekAnimator ? 'Animateur déjà sélectionné' : 'Sélectionner l\'animateur'}
                      {isThursdayOrFriday && !hasNextWeekAnimator && <span className="urgent-indicator">⚠️</span>}
                    </span>
                    <span className="button-subtitle">
                      {hasNextWeekAnimator ? 'Pour la semaine prochaine' : 
                       isThursdayOrFriday ? 'URGENT - Fin de semaine !' : 'Pour la semaine prochaine'}
                    </span>
                  </div>
                </button>
              </>
            );
          })()}
        </div>
      </div>

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
    </div>
  );
};