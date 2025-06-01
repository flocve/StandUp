// Test simple pour vérifier SQLite
import SQLiteDatabase from './database';

export async function testSQLite() {
  console.log('🧪 Test SQLite...');
  
  try {
    const db = SQLiteDatabase.getInstance();
    await db.initialize();
    
    const database = db.getDatabase();
    
    // Test simple d'insertion et lecture
    database.run(
      `INSERT OR REPLACE INTO weekly_participants 
       (id, name, chance_percentage, passage_count) 
       VALUES (?, ?, ?, ?)`,
      ['test-id', 'Test User', 5, 2]
    );
    
    const result = database.exec(`
      SELECT id, name, chance_percentage, passage_count 
      FROM weekly_participants 
      WHERE id = 'test-id'
    `);
    
    if (result[0] && result[0].values[0]) {
      const row = result[0].values[0];
      console.log('✅ Test réussi:', {
        id: row[0],
        name: row[1],
        chancePercentage: row[2],
        passageCount: row[3]
      });
    } else {
      console.log('❌ Aucun résultat trouvé');
    }
    
    // Nettoyer le test
    database.run(`DELETE FROM weekly_participants WHERE id = 'test-id'`);
    
    await db.save();
    console.log('✅ Test SQLite terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur test SQLite:', error);
    throw error;
  }
}

// Auto-test si exécuté directement
if (typeof window !== 'undefined') {
  // En mode navigateur, on peut tester
  console.log('Mode navigateur - test disponible via testSQLite()');
} 