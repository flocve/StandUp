// Utilitaires pour la gestion de la base de données SQLite
import SQLiteDatabase from './database';

export class DatabaseUtils {
  private static db = SQLiteDatabase.getInstance();

  /**
   * Affiche toutes les tables de la base de données
   */
  static async showTables(): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    const result = database.exec(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    console.log('📊 Tables disponibles:');
    if (result[0]) {
      result[0].values.forEach(row => {
        console.log(`  - ${row[0]}`);
      });
    }
  }

  /**
   * Affiche le schéma d'une table
   */
  static async showTableSchema(tableName: string): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    const result = database.exec(`PRAGMA table_info(${tableName})`);
    
    console.log(`📋 Schéma de la table "${tableName}":`);
    if (result[0]) {
      console.table(result[0].values.map(row => ({
        Column: row[1],
        Type: row[2],
        NotNull: row[3] ? 'YES' : 'NO',
        Default: row[4] || 'NULL',
        PrimaryKey: row[5] ? 'YES' : 'NO'
      })));
    }
  }

  /**
   * Affiche les statistiques de la base
   */
  static async showStats(): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    console.log('📈 Statistiques de la base:');
    
    // Nombre de participants
    const participants = database.exec('SELECT COUNT(*) as count FROM weekly_participants');
    console.log(`  👥 Participants: ${participants[0]?.values[0][0] || 0}`);
    
    // Nombre d'animations
    const animations = database.exec('SELECT COUNT(*) as count FROM animator_history');
    console.log(`  🎬 Animations totales: ${animations[0]?.values[0][0] || 0}`);
    
    // Participant le plus actif
    const topAnimator = database.exec(`
      SELECT p.name, COUNT(*) as animations
      FROM animator_history ah
      JOIN weekly_participants p ON ah.participant_id = p.id
      GROUP BY p.id, p.name
      ORDER BY animations DESC
      LIMIT 1
    `);
    
    if (topAnimator[0]?.values[0]) {
      const [name, count] = topAnimator[0].values[0];
      console.log(`  🏆 Top animateur: ${name} (${count} fois)`);
    }
    
    // Sessions quotidiennes
    const dailySessions = database.exec(`
      SELECT COUNT(*) as count 
      FROM daily_participants 
      WHERE has_spoken = 1
    `);
    console.log(`  📅 Participants quotidiens actifs: ${dailySessions[0]?.values[0][0] || 0}`);
  }

  /**
   * Nettoie toutes les données (ATTENTION: Irréversible!)
   */
  static async clearAllData(): Promise<void> {
    const confirmed = confirm('⚠️ ATTENTION: Cette action va supprimer TOUTES les données. Êtes-vous sûr?');
    if (!confirmed) {
      console.log('❌ Opération annulée');
      return;
    }

    await this.db.initialize();
    const database = this.db.getDatabase();
    
    // Supprimer dans l'ordre (contraintes de clés étrangères)
    database.run('DELETE FROM animator_history');
    database.run('DELETE FROM daily_participants');
    database.run('DELETE FROM weekly_participants');
    
    await this.db.save();
    console.log('🧹 Toutes les données ont été supprimées');
  }

  /**
   * Affiche l'historique récent des animations
   */
  static async showRecentHistory(limit: number = 10): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    const result = database.exec(`
      SELECT 
        p.name,
        ah.date,
        datetime(ah.date, 'localtime') as local_date
      FROM animator_history ah
      JOIN weekly_participants p ON ah.participant_id = p.id
      ORDER BY ah.date DESC
      LIMIT ?
    `, [limit]);
    
    console.log(`📜 Historique des ${limit} dernières animations:`);
    if (result[0]) {
      console.table(result[0].values.map(row => ({
        Animateur: row[0],
        Date: row[2] // Date locale
      })));
    } else {
      console.log('  Aucune animation enregistrée');
    }
  }

  /**
   * Exporte la base de données en format JSON (pour debug)
   */
  static async exportToJSON(): Promise<object> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    const participants = database.exec('SELECT * FROM weekly_participants');
    const dailyParticipants = database.exec('SELECT * FROM daily_participants');
    const history = database.exec('SELECT * FROM animator_history');
    
    const exportData = {
      timestamp: new Date().toISOString(),
      data: {
        weekly_participants: participants[0]?.values || [],
        daily_participants: dailyParticipants[0]?.values || [],
        animator_history: history[0]?.values || []
      }
    };
    
    console.log('📤 Données exportées:', exportData);
    return exportData;
  }

  /**
   * Réinitialise avec les données par défaut
   */
  static async resetToDefaults(): Promise<void> {
    await this.clearAllData();
    
    // Réinitialiser les données par défaut
    const database = this.db.getDatabase();
    const { INITIAL_PARTICIPANTS } = await import('./migrationHelper');
    
    for (const p of INITIAL_PARTICIPANTS) {
      database.run(
        `INSERT INTO weekly_participants (id, name, chance_percentage, passage_count) 
         VALUES (?, ?, ?, ?)`,
        [p.id.value, p.name.value, 1, 0]
      );
      
      database.run(
        `INSERT INTO daily_participants (id, name, last_participation, has_spoken, speaking_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [p.id.value, p.name.value, null, 0, null]
      );
    }
    
    await this.db.save();
    console.log('✅ Base réinitialisée avec les données par défaut');
  }

  /**
   * Ajoute un nouveau participant
   */
  static async addParticipant(name: string): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    // Générer un ID unique
    const id = Date.now().toString();
    
    try {
      // Ajouter dans les participants hebdomadaires
      database.run(
        `INSERT INTO weekly_participants (id, name, chance_percentage, passage_count) 
         VALUES (?, ?, ?, ?)`,
        [id, name, 1, 0]
      );
      
      // Ajouter dans les participants quotidiens
      database.run(
        `INSERT INTO daily_participants (id, name, last_participation, has_spoken, speaking_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, name, null, 0, null]
      );
      
      await this.db.save();
      console.log(`✅ Participant "${name}" ajouté avec succès !`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout de "${name}":`, error);
    }
  }

  /**
   * Supprime un participant par nom
   */
  static async removeParticipant(name: string): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    try {
      // Trouver l'ID du participant
      const result = database.exec(`
        SELECT id FROM weekly_participants 
        WHERE name = ?
      `, [name]);
      
      if (!result[0] || !result[0].values[0]) {
        console.warn(`⚠️ Participant "${name}" non trouvé`);
        return;
      }
      
      const participantId = result[0].values[0][0] as string;
      
      // Supprimer de toutes les tables
      database.run('DELETE FROM animator_history WHERE participant_id = ?', [participantId]);
      database.run('DELETE FROM daily_participants WHERE id = ?', [participantId]);
      database.run('DELETE FROM weekly_participants WHERE id = ?', [participantId]);
      
      await this.db.save();
      console.log(`✅ Participant "${name}" supprimé avec succès !`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de "${name}":`, error);
    }
  }

  /**
   * Liste tous les participants
   */
  static async listParticipants(): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    const result = database.exec(`
      SELECT name, chance_percentage, passage_count 
      FROM weekly_participants 
      ORDER BY name
    `);
    
    console.log('👥 Liste des participants:');
    if (result[0]) {
      console.table(result[0].values.map(row => ({
        Nom: row[0],
        'Chance %': row[1],
        'Nb Passages': row[2]
      })));
    } else {
      console.log('  Aucun participant trouvé');
    }
  }

  /**
   * Diagnostic complet de la base de données
   */
  static async diagnosticComplete(): Promise<void> {
    console.log('🔍 === DIAGNOSTIC COMPLET ===');
    
    try {
      await this.db.initialize();
      const database = this.db.getDatabase();
      
      // 1. Vérifier les tables
      console.log('📊 1. Tables disponibles:');
      const tables = database.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `);
      
      if (tables[0]) {
        tables[0].values.forEach(row => console.log(`  - ${row[0]}`));
      }
      
      // 2. Compter les participants
      console.log('\n📈 2. Comptage des participants:');
      
      const weeklyCount = database.exec('SELECT COUNT(*) as count FROM weekly_participants');
      const dailyCount = database.exec('SELECT COUNT(*) as count FROM daily_participants');
      const historyCount = database.exec('SELECT COUNT(*) as count FROM animator_history');
      
      console.log(`  👥 Participants hebdomadaires: ${weeklyCount[0]?.values[0]?.[0] || 0}`);
      console.log(`  📅 Participants quotidiens: ${dailyCount[0]?.values[0]?.[0] || 0}`);
      console.log(`  📜 Entrées historique: ${historyCount[0]?.values[0]?.[0] || 0}`);
      
      // 3. Lister les participants détaillés
      console.log('\n👥 3. Participants hebdomadaires détaillés:');
      const weeklyDetails = database.exec(`
        SELECT id, name, chance_percentage, passage_count 
        FROM weekly_participants 
        ORDER BY name
      `);
      
      if (weeklyDetails[0] && weeklyDetails[0].values.length > 0) {
        console.table(weeklyDetails[0].values.map(row => ({
          ID: row[0],
          Nom: row[1],
          'Chance %': row[2],
          'Passages': row[3]
        })));
      } else {
        console.log('  ❌ Aucun participant hebdomadaire trouvé !');
      }
      
      // 4. Lister les participants quotidiens
      console.log('\n📅 4. Participants quotidiens détaillés:');
      const dailyDetails = database.exec(`
        SELECT id, name, has_spoken, speaking_order 
        FROM daily_participants 
        ORDER BY name
      `);
      
      if (dailyDetails[0] && dailyDetails[0].values.length > 0) {
        console.table(dailyDetails[0].values.map(row => ({
          ID: row[0],
          Nom: row[1],
          'A parlé': row[2] ? 'Oui' : 'Non',
          'Ordre': row[3] || 'N/A'
        })));
      } else {
        console.log('  ❌ Aucun participant quotidien trouvé !');
      }
      
      // 5. Vérifier les données initiales
      console.log('\n🔧 5. Test de création des données initiales...');
      await this.initializeIfEmpty();
      
    } catch (error) {
      console.error('❌ Erreur lors du diagnostic:', error);
    }
  }

  /**
   * Initialise la base avec les données par défaut si elle est vide
   */
  static async initializeIfEmpty(): Promise<void> {
    await this.db.initialize();
    const database = this.db.getDatabase();
    
    // Vérifier si des participants existent
    const count = database.exec('SELECT COUNT(*) as count FROM weekly_participants');
    const participantCount = count[0]?.values[0]?.[0] as number;
    
    if (participantCount === 0) {
      console.log('🔄 Base vide détectée, initialisation...');
      
      const { INITIAL_PARTICIPANTS } = await import('./migrationHelper');
      
      for (const p of INITIAL_PARTICIPANTS) {
        try {
          database.run(
            `INSERT INTO weekly_participants (id, name, chance_percentage, passage_count) 
             VALUES (?, ?, ?, ?)`,
            [p.id.value, p.name.value, p.getChancePercentage(), 0]
          );
          
          database.run(
            `INSERT INTO daily_participants (id, name, last_participation, has_spoken, speaking_order) 
             VALUES (?, ?, ?, ?, ?)`,
            [p.id.value, p.name.value, null, 0, null]
          );
          
          console.log(`✅ Participant "${p.name.value}" initialisé`);
        } catch (error) {
          console.error(`❌ Erreur avec "${p.name.value}":`, error);
        }
      }
      
      await this.db.save();
      console.log('✅ Initialisation terminée');
    } else {
      console.log(`ℹ️ ${participantCount} participants déjà présents`);
    }
  }

  /**
   * Debug l'état de l'application React
   */
  static async debugReactApp(): Promise<void> {
    console.log('🔍 === DEBUG APPLICATION REACT ===');
    
    try {
      // 1. Tester le repository directement
      console.log('🧪 1. Test du repository SQLite...');
      const repo = new (await import('./participantRepository')).SQLiteParticipantRepository();
      await repo.initialize();
      
      const weeklyParticipants = await repo.getAllWeeklyParticipants();
      const dailyParticipants = await repo.getAllDailyParticipants();
      
      console.log(`✅ Repository: ${weeklyParticipants.length} weekly, ${dailyParticipants.length} daily`);
      
      // 2. Tester les use cases
      console.log('🧪 2. Test des use cases...');
      const { DailySelectionUseCases } = await import('../../../application/daily/useCases');
      const { WeeklySelectionUseCases } = await import('../../../application/weekly/useCases');
      
      const dailyUseCases = new DailySelectionUseCases(repo);
      const weeklyUseCases = new WeeklySelectionUseCases(repo);
      
      const availableDaily = await dailyUseCases.getAvailableParticipants();
      const allWeekly = await weeklyUseCases.getAllParticipants();
      
      console.log(`✅ Use Cases: ${availableDaily.length} daily disponibles, ${allWeekly.length} weekly`);
      
      // 3. Vérifier l'état React (si possible)
      console.log('🧪 3. État React...');
      const reactElements = document.querySelectorAll('[data-reactroot], #root');
      console.log(`✅ React: ${reactElements.length} éléments trouvés`);
      
      // 4. Chercher des erreurs dans la console
      console.log('🧪 4. Vérification des erreurs...');
      
      // Afficher un résumé
      console.log('\n📊 === RÉSUMÉ DEBUG ===');
      if (weeklyParticipants.length === 0) {
        console.warn('⚠️ Aucun participant dans la base !');
        console.log('💡 Solution: await dbUtils.resetToDefaults()');
      } else if (allWeekly.length === 0) {
        console.warn('⚠️ Use cases ne récupèrent pas les participants !');
        console.log('💡 Solution: Problème dans les use cases');
      } else {
        console.log('✅ Base de données et use cases OK');
        console.log('💡 Problème probablement dans le hook React ou l\'affichage');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du debug:', error);
    }
  }

  /**
   * Teste la chaîne complète depuis la DB jusqu'à l'affichage
   */
  static async testFullChain(): Promise<void> {
    console.log('🔗 === TEST CHAÎNE COMPLÈTE ===');
    
    try {
      // 1. Base de données
      await this.db.initialize();
      const database = this.db.getDatabase();
      const dbCount = database.exec('SELECT COUNT(*) as count FROM weekly_participants')[0]?.values[0]?.[0] || 0;
      console.log(`1️⃣ Base de données: ${dbCount} participants`);
      
      // 2. Repository
      const repo = new (await import('./participantRepository')).SQLiteParticipantRepository();
      await repo.initialize();
      const repoParticipants = await repo.getAllWeeklyParticipants();
      console.log(`2️⃣ Repository: ${repoParticipants.length} participants`);
      
      // 3. Use Cases
      const { WeeklySelectionUseCases } = await import('../../../application/weekly/useCases');
      const weeklyUseCases = new WeeklySelectionUseCases(repo);
      const useCaseParticipants = await weeklyUseCases.getAllParticipants();
      console.log(`3️⃣ Use Cases: ${useCaseParticipants.length} participants`);
      
      // 4. Simulation du hook
      console.log('4️⃣ Simulation du hook React...');
      if (useCaseParticipants.length > 0) {
        console.log('✅ Le hook devrait recevoir des participants');
        console.table(useCaseParticipants.map(p => ({
          ID: p.id.value,
          Nom: p.name.value,
          'Chance %': p.getChancePercentage()
        })));
      } else {
        console.error('❌ Le hook ne recevra aucun participant !');
      }
      
    } catch (error) {
      console.error('❌ Erreur dans la chaîne:', error);
    }
  }

  /**
   * Teste la persistance des données (pour debug les reloads)
   */
  static async testPersistence(): Promise<void> {
    console.log('🔄 === TEST DE PERSISTANCE ===');
    
    try {
      await this.db.initialize();
      const database = this.db.getDatabase();
      
      // 1. Vérifier les données actuelles
      const count = database.exec('SELECT COUNT(*) as count FROM weekly_participants')[0]?.values[0]?.[0] || 0;
      console.log(`📊 Participants actuels: ${count}`);
      
      // 2. Vérifier localStorage fallback si en mode fallback
      if (typeof window !== 'undefined' && localStorage) {
        const fallbackData = localStorage.getItem('sqlite_fallback_data');
        if (fallbackData) {
          const parsed = JSON.parse(fallbackData);
          console.log(`💾 Données localStorage: ${parsed.weekly_participants?.length || 0} participants`);
          console.log('🗃️ Contenu localStorage:', parsed);
        } else {
          console.log('⚠️ Aucune donnée localStorage trouvée');
        }
      }
      
      // 3. Tester l'ajout d'un participant temporaire
      const testParticipant = {
        id: 'test-' + Date.now(),
        name: 'Test Persistence',
        chance_percentage: 1,
        passage_count: 0
      };
      
      console.log('🧪 Ajout d\'un participant de test...');
      database.run(
        `INSERT INTO weekly_participants (id, name, chance_percentage, passage_count) VALUES (?, ?, ?, ?)`,
        [testParticipant.id, testParticipant.name, testParticipant.chance_percentage, testParticipant.passage_count]
      );
      
      await this.db.save();
      
      // 4. Vérifier que le participant a été ajouté
      const newCount = database.exec('SELECT COUNT(*) as count FROM weekly_participants')[0]?.values[0]?.[0] || 0;
      console.log(`✅ Nouveau total: ${newCount} participants`);
      
      // 5. Supprimer le participant de test
      database.run('DELETE FROM weekly_participants WHERE id = ?', [testParticipant.id]);
      await this.db.save();
      
      const finalCount = database.exec('SELECT COUNT(*) as count FROM weekly_participants')[0]?.values[0]?.[0] || 0;
      console.log(`🧹 Après nettoyage: ${finalCount} participants`);
      
      // 6. Instructions pour le test manuel
      console.log('\n📋 === INSTRUCTIONS TEST MANUEL ===');
      console.log('1. Notez le nombre de participants actuel');
      console.log('2. Rechargez la page (F5)');
      console.log('3. Relancez: await dbUtils.testPersistence()');
      console.log('4. Vérifiez que le nombre est identique');
      
    } catch (error) {
      console.error('❌ Erreur test persistance:', error);
    }
  }
}

// Fonctions utilitaires globales pour la console
if (typeof window !== 'undefined') {
  // En mode navigateur, rendre les utilitaires disponibles globalement
  (window as any).dbUtils = DatabaseUtils;
  console.log('🔧 Utilitaires DB disponibles via: dbUtils.showStats(), dbUtils.showTables(), etc.');
} 