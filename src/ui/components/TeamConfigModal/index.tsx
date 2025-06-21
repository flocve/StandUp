import React, { useState, useEffect } from 'react';
import { getParticipantPhotoUrlWithTheme } from '../../../utils/animalPhotos';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';
import './styles.css';

interface TeamConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  repository: any;
  onRefresh?: () => void;
}

type TabType = 'participants' | 'passageCount';

export const TeamConfigModal: React.FC<TeamConfigModalProps> = ({
  isOpen,
  onClose,
  repository,
  onRefresh
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingParticipant, setEditingParticipant] = useState<any>(null);
  const [editingAvatar, setEditingAvatar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allParticipants, setAllParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const loadParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const weeklyParticipants = await repository.getAllWeeklyParticipants();
      setAllParticipants(weeklyParticipants);
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadParticipants();
    }
  }, [isOpen]);

  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) return;
    
    setIsLoading(true);
    try {
      // Générer un ID unique pour le nouveau participant
      const newId = `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Ajouter à la table weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .insert({
          id: newId,
          name: newParticipantName.trim(),
          chance_percentage: 100,
          passage_count: 0,
          photo_url: null
        });

      if (weeklyError) throw weeklyError;

      // Ajouter à la table daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')  
        .insert({
          id: newId,
          name: newParticipantName.trim(),
          has_spoken: false,
          last_participation: null,
          speaking_order: null,
          photo_url: null
        });

      if (dailyError) throw dailyError;

      setNewParticipantName('');
      await loadParticipants();
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateParticipant = async (participant: any, newName: string) => {
    if (!newName.trim()) return;
    
    setIsLoading(true);
    try {
      const participantId = participant.id?.value || participant.id;
      
      // Mettre à jour dans weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .update({ name: newName.trim() })
        .eq('id', participantId);

      if (weeklyError) throw weeklyError;

      // Mettre à jour dans daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .update({ name: newName.trim() })
        .eq('id', participantId);

      if (dailyError) throw dailyError;

      setEditingParticipant(null);
      await loadParticipants();
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAvatar = async (participant: any, newPhotoUrl: string) => {
    setIsLoading(true);
    try {
      const participantId = participant.id?.value || participant.id;
      
      // Mettre à jour dans weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .update({ photo_url: newPhotoUrl })
        .eq('id', participantId);

      if (weeklyError) throw weeklyError;

      // Mettre à jour dans daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .update({ photo_url: newPhotoUrl })
        .eq('id', participantId);

      if (dailyError) throw dailyError;

      setEditingAvatar(null);
      await loadParticipants();
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassageCount = async (participant: any, newCount: number) => {
    setIsLoading(true);
    try {
      const participantId = participant.id?.value || participant.id;
      
      // Mettre à jour dans weekly_participants
      const { error } = await supabase
        .from('weekly_participants')
        .update({ passage_count: newCount })
        .eq('id', participantId);

      if (error) throw error;

      await loadParticipants();
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du passage count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteParticipant = async (participant: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${getNameString(participant)} ?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const participantId = participant.id?.value || participant.id;
      
      // Supprimer de weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .delete()
        .eq('id', participantId);

      if (weeklyError) throw weeklyError;

      // Supprimer de daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .delete()
        .eq('id', participantId);

      if (dailyError) throw dailyError;

      // Supprimer de animator_history
      const { error: historyError } = await supabase
        .from('animator_history')
        .delete()
        .eq('participant_id', participantId);

      if (historyError) throw historyError;

      await loadParticipants();
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors de la suppression du participant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNameString = (participant: any) => {
    if (!participant) return '';
    if (typeof participant.name === 'object' && 'value' in participant.name) {
      return participant.name.value;
    }
    if (typeof participant.name === 'string') return participant.name;
    return '';
  };

  const getPhotoUrl = (participant: any) => {
    const participantName = getNameString(participant);
    const customPhotoUrl = participant?.getPhotoUrl?.();
    return getParticipantPhotoUrlWithTheme(participantName, customPhotoUrl, theme);
  };

  const getAvatarColor = (name?: string) => {
    if (!name) return { bg: '#4f7cff', text: '#ffffff' };
    
    const colors = [
      { bg: '#4f7cff', text: '#ffffff' },
      { bg: '#7c3aed', text: '#ffffff' },
      { bg: '#06b6d4', text: '#ffffff' },
      { bg: '#10b981', text: '#ffffff' },
      { bg: '#f59e0b', text: '#ffffff' },
      { bg: '#ef4444', text: '#ffffff' },
      { bg: '#8b5cf6', text: '#ffffff' },
      { bg: '#06d6a0', text: '#ffffff' },
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (!isOpen) return null;

  return (
    <div className="team-config-modal-overlay">
      <div className="team-config-modal">
        <div className="team-config-header">
          <h2>Configuration de l'équipe</h2>
          <button className="team-config-close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="team-config-tabs">
          <button
            className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            👥 Participants
          </button>
          <button
            className={`tab-button ${activeTab === 'passageCount' ? 'active' : ''}`}
            onClick={() => setActiveTab('passageCount')}
          >
            👑 Animateurs
          </button>
        </div>

        <div className="team-config-content">
          {activeTab === 'participants' && (
            <div className="participants-tab">
              <div className="add-participant-section">
                <h3>Ajouter un participant</h3>
                <div className="add-participant-form">
                  <input
                    type="text"
                    placeholder="Nom du participant"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddParticipant();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddParticipant}
                    disabled={!newParticipantName.trim() || isLoading}
                    className="add-button"
                  >
                    {isLoading ? '⏳' : '➕'} Ajouter
                  </button>
                </div>
              </div>

              <div className="participants-list">
                <h3>Participants actuels ({allParticipants.length})</h3>
                {participantsLoading ? (
                  <div className="loading">Chargement...</div>
                ) : (
                  <div className="participants-grid">
                    {allParticipants.map((participant) => {
                      const participantName = getNameString(participant);
                      const avatarColor = getAvatarColor(participantName);
                      const isEditing = editingParticipant?.id === participant.id;
                      const isEditingAvatar = editingAvatar?.id === participant.id;

                      return (
                        <div key={participant.id?.value || participant.id} className="participant-item">
                          <div className="participant-avatar" onClick={() => setEditingAvatar(participant)}>
                            <img
                              src={getPhotoUrl(participant)}
                              alt={participantName}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  target.style.display = 'none';
                                  parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                  parent.innerHTML = `<div class="avatar-fallback">${participantName.charAt(0).toUpperCase()}</div>`;
                                }
                              }}
                            />
                            <div className="avatar-edit-overlay">📷</div>
                          </div>
                          <div className="participant-info">
                            {isEditing ? (
                              <input
                                type="text"
                                defaultValue={participantName}
                                onBlur={(e) => handleUpdateParticipant(participant, e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateParticipant(participant, (e.target as HTMLInputElement).value);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingParticipant(null);
                                  }
                                }}
                                autoFocus
                                className="edit-input"
                              />
                            ) : (
                              <span className="participant-name">{participantName}</span>
                            )}
                            {isEditingAvatar ? (
                              <div className="avatar-url-edit">
                                <input
                                  type="url"
                                  placeholder="URL de l'avatar (ou vide pour auto)"
                                  defaultValue={participant.getPhotoUrl?.() || ''}
                                  onBlur={(e) => handleUpdateAvatar(participant, e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateAvatar(participant, (e.target as HTMLInputElement).value);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingAvatar(null);
                                    }
                                  }}
                                  autoFocus
                                  className="edit-input"
                                />
                              </div>
                            ) : null}
                          </div>
                          <div className="participant-actions">
                            <button
                              onClick={() => setEditingParticipant(participant)}
                              className="edit-button"
                              title="Modifier le nom"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(participant)}
                              className="delete-button"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'passageCount' && (
            <div className="passage-count-tab">
              <div className="passage-count-info">
                <h3>Gestion des Animateurs</h3>
                <p>Modifiez le nombre de fois que chaque participant a été animateur.</p>
                
                <div className="passage-count-list">
                  <div className="passage-count-grid">
                    {allParticipants
                      .sort((a, b) => getNameString(a).localeCompare(getNameString(b)))
                      .map((participant) => {
                        const participantName = getNameString(participant);
                        const avatarColor = getAvatarColor(participantName);
                        const currentCount = participant.getPassageCount ? participant.getPassageCount() : 0;

                        return (
                          <div key={participant.id?.value || participant.id} className="passage-count-item">
                            <div className="passage-participant-info">
                              <div className="passage-avatar">
                                <img
                                  src={getPhotoUrl(participant)}
                                  alt={participantName}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      target.style.display = 'none';
                                      parent.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                                      parent.innerHTML = `<div class="avatar-fallback">${participantName.charAt(0).toUpperCase()}</div>`;
                                    }
                                  }}
                                />
                              </div>
                              <span className="passage-participant-name">{participantName}</span>
                            </div>
                            <div className="passage-count-controls">
                              <button
                                onClick={() => handleUpdatePassageCount(participant, Math.max(0, currentCount - 1))}
                                className="count-button decrease"
                                disabled={currentCount <= 0}
                              >
                                ➖
                              </button>
                              <span className="count-display">{currentCount}</span>
                              <button
                                onClick={() => handleUpdatePassageCount(participant, currentCount + 1)}
                                className="count-button increase"
                              >
                                ➕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamConfigModal; 