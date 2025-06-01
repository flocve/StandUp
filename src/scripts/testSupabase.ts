// Script de test pour vérifier la configuration Supabase
import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('🧪 Test de connexion Supabase...');
  
  try {
    // Test 1: Connexion basique
    const { data, error } = await supabase
      .from('weekly_participants')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      return false;
    }
    
    console.log('✅ Connexion Supabase OK');
    
    // Test 2: Vérifier les tables
    const tables = ['weekly_participants', 'daily_participants', 'animator_history'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error(`❌ Table ${table} non trouvée:`, tableError.message);
        return false;
      }
      
      console.log(`✅ Table ${table} accessible`);
    }
    
    // Test 3: Test d'écriture (insertion puis suppression)
    const testId = `test-${Date.now()}`;
    
    const { error: insertError } = await supabase
      .from('weekly_participants')
      .insert({
        id: testId,
        name: 'Test User',
        chance_percentage: 1,
        passage_count: 0
      });
    
    if (insertError) {
      console.error('❌ Erreur d\'insertion test:', insertError.message);
      return false;
    }
    
    console.log('✅ Insertion test OK');
    
    // Nettoyage
    await supabase
      .from('weekly_participants')
      .delete()
      .eq('id', testId);
    
    console.log('✅ Nettoyage test OK');
    
    console.log('🎉 Tous les tests Supabase réussis !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
};

// Test des permissions temps réel
export const testRealtimePermissions = async () => {
  console.log('🔄 Test des permissions temps réel...');
  
  try {
    const channel = supabase
      .channel('test_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'weekly_participants' },
        (payload) => {
          console.log('📡 Changement détecté:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut channel:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Permissions temps réel OK');
          channel.unsubscribe();
        }
      });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur permissions temps réel:', error);
    return false;
  }
};

// Fonction globale pour les DevTools
(window as any).testSupabase = async () => {
  console.log('🚀 Démarrage des tests Supabase...');
  
  const connectionOK = await testSupabaseConnection();
  const realtimeOK = await testRealtimePermissions();
  
  if (connectionOK && realtimeOK) {
    console.log('🎉 Configuration Supabase parfaite !');
  } else {
    console.log('⚠️ Problèmes détectés - voir logs ci-dessus');
  }
}; 