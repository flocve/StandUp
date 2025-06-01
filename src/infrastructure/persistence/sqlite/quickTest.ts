// Test rapide pour vérifier que SQLite fonctionne
import SQLiteDatabase from './database';
import { SQLiteParticipantRepository } from './participantRepository';

export async function quickSQLiteTest() {
  console.log('🧪 Test rapide SQLite...');
  
  try {
    const db = SQLiteDatabase.getInstance();
    await db.initialize();
    
    const database = db.getDatabase();
    
    // Test simple : compter les participants
    const result = database.exec('SELECT COUNT(*) as count FROM weekly_participants');
    const count = result[0]?.values[0]?.[0] || 0;
    
    console.log(`✅ Test réussi : ${count} participants trouvés`);
    console.log('🎉 SQLite fonctionne correctement !');
    
    return true;
  } catch (error) {
    console.error('❌ Test échoué:', error);
    return false;
  }
}

/**
 * Test simple pour vérifier que SQLite marche vraiment (pas de fallback)
 */
export async function testRealSQLite() {
  console.log('🔍 === TEST SQLITE RÉEL ===');
  
  try {
    const db = SQLiteDatabase.getInstance();
    await db.initialize();
    
    const database = db.getDatabase();
    
    // Vérifier qu'on a bien un vrai objet SQLite
    if (typeof database.exec !== 'function') {
      console.error('❌ Pas un vrai objet SQLite !');
      return false;
    }
    
    // Test d'une requête simple
    database.run('CREATE TABLE IF NOT EXISTS test_table (id INTEGER, name TEXT)');
    database.run('INSERT INTO test_table (id, name) VALUES (?, ?)', [1, 'test']);
    
    const result = database.exec('SELECT * FROM test_table');
    
    if (result[0] && result[0].values[0]) {
      console.log('✅ SQLite fonctionne parfaitement !');
      console.log('📊 Données test:', result[0].values);
      
      // Nettoyer
      database.run('DROP TABLE test_table');
      
      return true;
    } else {
      console.error('❌ Requête SQLite échouée');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur SQLite:', error);
    return false;
  }
}

export async function testParticipantRepository() {
  console.log('🧪 Test du repository de participants...');
  
  try {
    const repo = new SQLiteParticipantRepository();
    await repo.initialize();
    
    // Test des participants hebdomadaires
    console.log('🔄 Test participants hebdomadaires...');
    const weeklyParticipants = await repo.getAllWeeklyParticipants();
    console.log(`✅ ${weeklyParticipants.length} participants hebdomadaires chargés`);
    
    if (weeklyParticipants.length > 0) {
      console.table(weeklyParticipants.map(p => ({
        ID: p.id.value,
        Nom: p.name.value,
        'Chance %': p.getChancePercentage()
      })));
    }
    
    // Test des participants quotidiens
    console.log('🔄 Test participants quotidiens...');
    const dailyParticipants = await repo.getAllDailyParticipants();
    console.log(`✅ ${dailyParticipants.length} participants quotidiens chargés`);
    
    if (dailyParticipants.length > 0) {
      console.table(dailyParticipants.map(p => ({
        ID: p.id.value,
        Nom: p.name.value,
        'A parlé': p.hasSpoken() ? 'Oui' : 'Non'
      })));
    }
    
    if (weeklyParticipants.length === 0 && dailyParticipants.length === 0) {
      console.warn('⚠️ Aucun participant trouvé - il peut y avoir un problème d\'initialisation');
      return false;
    }
    
    console.log('🎉 Repository fonctionne correctement !');
    return true;
    
  } catch (error) {
    console.error('❌ Test repository échoué:', error);
    return false;
  }
}

// Auto-test si exécuté directement dans la console
if (typeof window !== 'undefined') {
  (window as any).testSQLite = quickSQLiteTest;
  (window as any).testRealSQLite = testRealSQLite;
  (window as any).testRepository = testParticipantRepository;
  console.log('🔧 Tests disponibles:');
  console.log('  - testSQLite() : Test de base');
  console.log('  - testRealSQLite() : Test SQLite réel (pas de mock)');
  console.log('  - testRepository() : Test du repository');
  console.log('  - dbUtils.diagnosticComplete() : Diagnostic complet');
} 