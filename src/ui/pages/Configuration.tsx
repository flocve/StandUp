import React, { useState, useEffect } from 'react';
import { DatabaseUtils } from '../../infrastructure/persistence/sqlite/utils';
import SQLiteDatabase from '../../infrastructure/persistence/sqlite/database';
import './Configuration.css';

interface DbData {
  weeklyParticipants: any[];
  dailyParticipants: any[];
  animatorHistory: any[];
}

export const Configuration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'data' | 'tools' | 'stats'>('data');
  const [dbData, setDbData] = useState<DbData>({ weeklyParticipants: [], dailyParticipants: [], animatorHistory: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [removeParticipantName, setRemoveParticipantName] = useState('');

  // Charger les données de la DB
  const loadDbData = async () => {
    setIsLoading(true);
    try {
      const db = SQLiteDatabase.getInstance();
      await db.initialize();
      const database = db.getDatabase();

      // Charger les participants hebdomadaires
      const weeklyResult = database.exec(`
        SELECT id, name, chance_percentage, passage_count 
        FROM weekly_participants 
        ORDER BY name
      `);
      
      // Charger les participants quotidiens
      const dailyResult = database.exec(`
        SELECT id, name, last_participation, has_spoken, speaking_order 
        FROM daily_participants 
        ORDER BY name
      `);

      // Charger l'historique
      const historyResult = database.exec(`
        SELECT ah.id, p.name, ah.date 
        FROM animator_history ah
        JOIN weekly_participants p ON ah.participant_id = p.id
        ORDER BY ah.date DESC
        LIMIT 20
      `);

      setDbData({
        weeklyParticipants: weeklyResult[0]?.values || [],
        dailyParticipants: dailyResult[0]?.values || [],
        animatorHistory: historyResult[0]?.values || []
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setMessage('❌ Erreur lors du chargement des données');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadDbData();
  }, []);

  // Utilitaires
  const handleAddParticipant = async () => {
    if (!newParticipantName.trim()) return;
    
    setIsLoading(true);
    try {
      await DatabaseUtils.addParticipant(newParticipantName.trim());
      setMessage(`✅ Participant "${newParticipantName}" ajouté !`);
      setNewParticipantName('');
      await loadDbData();
    } catch (error) {
      setMessage('❌ Erreur lors de l\'ajout');
    }
    setIsLoading(false);
  };

  const handleRemoveParticipant = async () => {
    if (!removeParticipantName.trim()) return;
    
    setIsLoading(true);
    try {
      await DatabaseUtils.removeParticipant(removeParticipantName.trim());
      setMessage(`✅ Participant "${removeParticipantName}" supprimé !`);
      setRemoveParticipantName('');
      await loadDbData();
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression');
    }
    setIsLoading(false);
  };

  const handleResetToDefaults = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir réinitialiser toutes les données ?')) return;
    
    setIsLoading(true);
    try {
      await DatabaseUtils.resetToDefaults();
      setMessage('✅ Base de données réinitialisée !');
      await loadDbData();
    } catch (error) {
      setMessage('❌ Erreur lors de la réinitialisation');
    }
    setIsLoading(false);
  };

  const handleClearAllData = async () => {
    if (!confirm('🚨 ATTENTION: Supprimer TOUTES les données ? (irréversible)')) return;
    
    setIsLoading(true);
    try {
      await DatabaseUtils.clearAllData();
      setMessage('🧹 Toutes les données supprimées !');
      await loadDbData();
    } catch (error) {
      setMessage('❌ Erreur lors de la suppression');
    }
    setIsLoading(false);
  };

  const handleShowStats = async () => {
    try {
      await DatabaseUtils.showStats();
      setMessage('📊 Statistiques affichées dans la console');
    } catch (error) {
      setMessage('❌ Erreur lors de l\'affichage des stats');
    }
  };

  return (
    <div className="config-overlay">
      <div className="config-modal">
        <div className="config-header">
          <h2>⚙️ Configuration & Base de Données</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
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
                <h3>🔄 Réinitialisation</h3>
                <div className="form-group">
                  <button onClick={handleResetToDefaults} disabled={isLoading} className="warning">
                    🔄 Réinitialiser aux valeurs par défaut
                  </button>
                  <button onClick={handleClearAllData} disabled={isLoading} className="danger">
                    🗑️ Supprimer toutes les données
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
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>👥 Participants Hebdomadaires</h3>
                  <div className="stat-value">{dbData.weeklyParticipants.length}</div>
                </div>
                <div className="stat-card">
                  <h3>📅 Participants Quotidiens</h3>
                  <div className="stat-value">{dbData.dailyParticipants.length}</div>
                </div>
                <div className="stat-card">
                  <h3>🎬 Animations Totales</h3>
                  <div className="stat-value">{dbData.animatorHistory.length}</div>
                </div>
                <div className="stat-card">
                  <h3>✅ Participants Actifs</h3>
                  <div className="stat-value">
                    {dbData.dailyParticipants.filter(p => p[3]).length}
                  </div>
                </div>
              </div>

              <div className="tool-section">
                <h3>📊 Statistiques Console</h3>
                <div className="form-group">
                  <button onClick={handleShowStats}>
                    📊 Afficher stats détaillées (console)
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