import { supabase } from '../../../lib/supabase';
import { INITIAL_PARTICIPANTS } from './migrationHelper';

export class SupabaseUtils {
  
  // Ajouter un participant
  static async addParticipant(name: string): Promise<void> {
    const participantId = `participant-${Date.now()}`;
    
    try {
      // Ajouter dans weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .insert({
          id: participantId,
          name: name,
          chance_percentage: 1,
          passage_count: 0
        });

      if (weeklyError) throw weeklyError;

      // Ajouter dans daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .insert({
          id: participantId,
          name: name,
          last_participation: null,
          has_spoken: false,
          speaking_order: null
        });

      if (dailyError) throw dailyError;

    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du participant:', error);
      throw error;
    }
  }

  // Supprimer un participant
  static async removeParticipant(name: string): Promise<void> {
    try {
      // Trouver le participant
      const { data: participant, error: findError } = await supabase
        .from('weekly_participants')
        .select('id')
        .eq('name', name)
        .single();

      if (findError || !participant) {
        throw new Error(`Participant "${name}" non trouvé`);
      }

      // Supprimer de animator_history (cascade)
      await supabase
        .from('animator_history')
        .delete()
        .eq('participant_id', participant.id);

      // Supprimer de daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .delete()
        .eq('id', participant.id);

      if (dailyError) throw dailyError;

      // Supprimer de weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .delete()
        .eq('id', participant.id);

      if (weeklyError) throw weeklyError;

    } catch (error) {
      console.error('❌ Erreur lors de la suppression du participant:', error);
      throw error;
    }
  }

  // Lister tous les participants
  static async listParticipants(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('weekly_participants')
        .select('*')
        .order('name');

      if (error) throw error;

      console.log('👥 Liste des participants:');
      data?.forEach(p => {
        console.log(`  - ${p.name} (${p.chance_percentage}%, ${p.passage_count} passages)`);
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des participants:', error);
    }
  }

  // Afficher les statistiques
  static async showStats(): Promise<{ [key: string]: number }> {
    try {
      // Compter participants hebdomadaires
      const { count: weeklyCount } = await supabase
        .from('weekly_participants')
        .select('*', { count: 'exact', head: true });

      // Compter participants quotidiens
      const { count: dailyCount } = await supabase
        .from('daily_participants')
        .select('*', { count: 'exact', head: true });

      // Compter historique animateurs
      const { count: historyCount } = await supabase
        .from('animator_history')
        .select('*', { count: 'exact', head: true });

      const stats = {
        weeklyParticipants: weeklyCount || 0,
        dailyParticipants: dailyCount || 0,
        animatorHistory: historyCount || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return {};
    }
  }

  // Réinitialiser avec les données par défaut
  static async resetToDefaults(): Promise<void> {
    try {
      // Supprimer toutes les données
      await this.clearAllData();

      // Réinsérer les données par défaut
      const weeklyData = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        chance_percentage: p.getChancePercentage(),
        passage_count: 0
      }));

      const dailyData = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        last_participation: null,
        has_spoken: false,
        speaking_order: null
      }));

      // Insérer weekly_participants
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .insert(weeklyData);

      if (weeklyError) throw weeklyError;

      // Insérer daily_participants
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .insert(dailyData);

      if (dailyError) throw dailyError;

    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
    }
  }

  // Supprimer toutes les données
  static async clearAllData(): Promise<void> {
    try {
      // Supprimer dans l'ordre (à cause des foreign keys)
      await supabase.from('animator_history').delete().neq('id', 0);
      await supabase.from('daily_participants').delete().neq('id', '');
      await supabase.from('weekly_participants').delete().neq('id', '');

    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  }

  // Obtenir les données formatées pour l'interface
  static async getFormattedData(): Promise<{
    weeklyParticipants: any[];
    dailyParticipants: any[];
    animatorHistory: any[];
  }> {
    try {
      // Participants hebdomadaires
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_participants')
        .select('id, name, chance_percentage, passage_count')
        .order('name');

      if (weeklyError) throw weeklyError;

      // Participants quotidiens
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_participants')
        .select('id, name, last_participation, has_spoken, speaking_order')
        .order('name');

      if (dailyError) throw dailyError;

      // Historique avec noms
      const { data: historyData, error: historyError } = await supabase
        .from('animator_history')
        .select(`
          id,
          participant_id,
          date,
          weekly_participants!inner(name)
        `)
        .order('date', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      return {
        weeklyParticipants: weeklyData?.map(p => [p.id, p.name, p.chance_percentage, p.passage_count]) || [],
        dailyParticipants: dailyData?.map(p => [p.id, p.name, p.last_participation, p.has_spoken, p.speaking_order]) || [],
        animatorHistory: historyData?.map(h => [h.id, (h.weekly_participants as any).name, h.date]) || []
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données:', error);
      return { weeklyParticipants: [], dailyParticipants: [], animatorHistory: [] };
    }
  }

  // Diagnostic complet
  static async diagnosticComplete(): Promise<void> {
    try {
      // Test connexion
      const { data, error } = await supabase
        .from('weekly_participants')
        .select('count')
        .limit(1);

      if (error) {
        console.error(error);
        return;
      }

      // Statistiques
      await this.showStats();

      // Test des tables
      const tables = ['weekly_participants', 'daily_participants', 'animator_history'];
      for (const table of tables) {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
      }

    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
    }
  }
}

// Exposer globalement pour la console
(window as any).supabaseUtils = SupabaseUtils; 