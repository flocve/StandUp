import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SupabaseUtils } from '../../infrastructure/persistence/supabase/utils';
import { PhotoManager } from '../components/PhotoManager';
import './Configuration.css';

interface DbData {
  weeklyParticipants: any[];
  dailyParticipants: any[];
  animatorHistory: any[];
}

export const Configuration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'tools' | 'photos' | 'stats'>('data');
  const [dbData, setDbData] = useState<DbData>({ weeklyParticipants: [], dailyParticipants: [], animatorHistory: [] });
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [removeParticipantName, setRemoveParticipantName] = useState('');
  const [stats, setStats] = useState<{ [key: string]: number }>({});

  // Charger les données de la DB (Supabase)
  const loadDbData = async () => {
    setIsLoading(true);
    try {
      const data = await SupabaseUtils.getFormattedData();
      setDbData(data);
      
      // Charger les participants pour le PhotoManager
      const { data: weeklyData } = await supabase
        .from('weekly_participants')
        .select('id, name, photo_url')
        .order('name');
      
      if (weeklyData) {
        setParticipants(weeklyData.map(p => ({
          id: { value: p.id },
          name: { value: p.name },
          getPhotoUrl: () => p.photo_url
        })));
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setMessage('❌ Erreur lors du chargement des données Supabase');
    }
    setIsLoading(false);
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const statsData = await SupabaseUtils.showStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  useEffect(() => {
    loadDbData();
    loadStats();
  }, []);

  // Utilitaires
  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) return;
    
    setIsLoading(true);
    try {
      await SupabaseUtils.addParticipant(newParticipantName.trim());
      setMessage(`✅ Participant "${newParticipantName}" ajouté dans Supabase !`);
      setNewParticipantName('');
      await loadDbData();
      await loadStats();
    } catch (error) {
      setMessage('❌ Erreur lors de l\'ajout dans Supabase');
    }
    setIsLoading(false);
  };

  const handleRemoveParticipant = async () => {
    if (!removeParticipantName.trim()) return;
    if (!confirm(`⚠️ Supprimer le participant "${removeParticipantName}" ?`)) return;
    
    setIsLoading(true);
    try {
      await SupabaseUtils.removeParticipant(removeParticipantName);
      setMessage(`✅ Participant "${removeParticipantName}" supprimé !`);
      setRemoveParticipantName('');
      await loadDbData();
      await loadStats();
    } catch (error) {
      setMessage(`❌ Erreur lors de la suppression du participant`);
    }
    setIsLoading(false);
  };

  const handleShowStats = async () => {
    try {
      await SupabaseUtils.showStats();
      setMessage('📊 Statistiques Supabase affichées dans la console');
      await loadStats();
    } catch (error) {
      setMessage('❌ Erreur lors de l\'affichage des stats Supabase');
    }
  };

  const handleDiagnostic = async () => {
    try {
      await SupabaseUtils.diagnosticComplete();
      setMessage('🔍 Diagnostic Supabase complet dans la console');
    } catch (error) {
      setMessage('❌ Erreur lors du diagnostic Supabase');
    }
  };

  const handleUpdatePhoto = async (participantId: string, photoUrl: string) => {
    // Implementation of handleUpdatePhoto function
  };

  return (
    <div className="config-overlay">
      <div className="config-modal">
        <div className="config-header">
          <h2>⚙️ Configuration Supabase</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', margin: '0 1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          🌐 <strong>Mode Supabase</strong> - Base de données partagée en temps réel
        </div>

        <div className="config-tabs">
          <button 
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            📊 Données
          </button>
          <button 
            className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            🔧 Outils
          </button>
          <button 
            className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            📸 Photos
          </button>
          <button 
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📈 Statistiques
          </button>
        </div>

        <div className="config-content">
          {message && (
            <div className="message">
              {message}
              <button onClick={() => setMessage('')}>✕</button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-tab">
              <div className="data-section">
                <h3>👥 Participants Hebdomadaires ({dbData.weeklyParticipants.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Chance %</th>
                        <th>Passages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbData.weeklyParticipants.map((row, i) => (
                        <tr key={i}>
                          <td>{row[0]}</td>
                          <td><strong>{row[1]}</strong></td>
                          <td>{row[2]}</td>
                          <td>{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="data-section">
                <h3>📅 Participants Quotidiens ({dbData.dailyParticipants.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Dernière Participation</th>
                        <th>A Parlé</th>
                        <th>Ordre</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbData.dailyParticipants.map((row, i) => (
                        <tr key={i}>
                          <td>{row[0]}</td>
                          <td><strong>{row[1]}</strong></td>
                          <td>{row[2] ? new Date(row[2]).toLocaleString() : '-'}</td>
                          <td>{row[3] ? '✅' : '❌'}</td>
                          <td>{row[4] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="data-section">
                <h3>🎬 Historique Animations ({dbData.animatorHistory.length})</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Animateur</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbData.animatorHistory.map((row, i) => (
                        <tr key={i}>
                          <td>{row[0]}</td>
                          <td><strong>{row[1]}</strong></td>
                          <td>{new Date(row[2]).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="tools-tab">
              <div className="tool-section">
                <h3>➕ Ajouter un Participant</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nom du participant"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                  />
                  <button onClick={handleAddParticipant} disabled={isLoading}>
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="tool-section">
                <h3>➖ Supprimer un Participant</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Nom du participant à supprimer"
                    value={removeParticipantName}
                    onChange={(e) => setRemoveParticipantName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRemoveParticipant()}
                  />
                  <button onClick={handleRemoveParticipant} disabled={isLoading} className="danger">
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="tool-section">
                <h3>🔄 Actualisation</h3>
                <div className="form-group">
                  <button onClick={loadDbData} disabled={isLoading}>
                    🔄 Recharger les données
                  </button>
                </div>
              </div>

              <div className="tool-section">
                <h3>🔍 Diagnostic Supabase</h3>
                <div className="form-group">
                  <button onClick={handleDiagnostic} disabled={isLoading}>
                    🔍 Diagnostic complet (console)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="photos-tab">
              <PhotoManager
                participants={participants}
                onUpdatePhoto={handleUpdatePhoto}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>👥 Participants Hebdomadaires</h3>
                  <div className="stat-value">{stats.weeklyParticipants || dbData.weeklyParticipants.length}</div>
                </div>
                <div className="stat-card">
                  <h3>📅 Participants Quotidiens</h3>
                  <div className="stat-value">{stats.dailyParticipants || dbData.dailyParticipants.length}</div>
                </div>
                <div className="stat-card">
                  <h3>🎬 Animations Totales</h3>
                  <div className="stat-value">{stats.animatorHistory || dbData.animatorHistory.length}</div>
                </div>
                <div className="stat-card">
                  <h3>✅ Participants Actifs Aujourd'hui</h3>
                  <div className="stat-value">
                    {dbData.dailyParticipants.filter(p => p[3]).length}
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>🌐 Informations Supabase</h3>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <div>📊 <strong>Base partagée</strong> : Toutes les modifications sont synchronisées en temps réel</div>
                  <div>🔄 <strong>Temps réel actif</strong> : Les changements apparaissent instantanément</div>
                  <div>💾 <strong>Persistance cloud</strong> : Données sauvées automatiquement</div>
                  <div>👥 <strong>Multi-utilisateurs</strong> : Plusieurs personnes peuvent utiliser simultanément</div>
                </div>
              </div>

              <div className="tool-section">
                <h3>📊 Statistiques Console</h3>
                <div className="form-group">
                  <button onClick={handleShowStats}>
                    📊 Afficher stats détaillées (console)
                  </button>
                  <button onClick={handleDiagnostic}>
                    🔍 Diagnostic complet (console)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner">🔄</div>
            Chargement...
          </div>
        )}
      </div>
    </div>
  );
}; 