import { supabase } from '../../../lib/supabase';
import type { WeeklyParticipant, DailyParticipant, AnimatorHistory } from '../../../lib/supabase';
import { Participant, DailyParticipant as DomainDailyParticipant } from '../../../domain/participant/entities';
import { ParticipantId, ParticipantName } from '../../../domain/participant/valueObjects';
import type { ParticipantRepository } from '../../../domain/participant/repository';
import { INITIAL_PARTICIPANTS } from './migrationHelper';

export class SupabaseParticipantRepository implements ParticipantRepository {
  
  async initialize(): Promise<void> {
    // Vérifier si des participants existent déjà
    const { data: existing, error } = await supabase
      .from('weekly_participants')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Erreur lors de la vérification des données:', error);
      return;
    }

    // Si aucun participant, initialiser avec les données par défaut
    if (!existing || existing.length === 0) {
      await this.initializeWithDefaults();
    }
  }

  private async initializeWithDefaults(): Promise<void> {
    console.log('🔄 Initialisation Supabase avec données par défaut...');
    
    try {
      // Préparer les données pour l'insertion
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

      // Insérer les participants hebdomadaires
      const { error: weeklyError } = await supabase
        .from('weekly_participants')
        .insert(weeklyData);

      if (weeklyError) {
        console.error('Erreur insertion weekly_participants:', weeklyError);
      }

      // Insérer les participants quotidiens
      const { error: dailyError } = await supabase
        .from('daily_participants')
        .insert(dailyData);

      if (dailyError) {
        console.error('Erreur insertion daily_participants:', dailyError);
      }

      console.log('✅ Données par défaut initialisées dans Supabase');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }

  async getAllWeeklyParticipants(): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('weekly_participants')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erreur lors du chargement des participants hebdomadaires:', error);
      return [];
    }

    if (!data) return [];

    return data.map(row => {
      const participant = new Participant(
        new ParticipantId(row.id),
        new ParticipantName(row.name),
        row.chance_percentage
      );
      participant.setPassageCount(row.passage_count);
      return participant;
    });
  }

  async getAllDailyParticipants(): Promise<DomainDailyParticipant[]> {
    const { data, error } = await supabase
      .from('daily_participants')
      .select('*')
      .order('speaking_order, name');

    if (error) {
      console.error('Erreur lors du chargement des participants quotidiens:', error);
      return [];
    }

    if (!data) return [];

    return data.map(row => {
      return new DomainDailyParticipant(
        new ParticipantId(row.id),
        new ParticipantName(row.name),
        row.has_spoken,
        row.last_participation ? new Date(row.last_participation) : undefined
      );
    });
  }

  async updateParticipant(participant: Participant): Promise<void> {
    const { error } = await supabase
      .from('weekly_participants')
      .update({
        chance_percentage: participant.getChancePercentage(),
        updated_at: new Date().toISOString()
      })
      .eq('id', participant.id.value);

    if (error) {
      console.error('Erreur lors de la mise à jour du participant:', error);
      throw error;
    }
  }

  async updateDailyParticipant(participant: DomainDailyParticipant): Promise<void> {
    // Calculer l'ordre de passage si nécessaire
    let speakingOrder: number | null = null;
    if (participant.hasSpoken()) {
      const { data } = await supabase
        .from('daily_participants')
        .select('speaking_order')
        .not('speaking_order', 'is', null)
        .order('speaking_order', { ascending: false })
        .limit(1);

      speakingOrder = data && data.length > 0 ? (data[0].speaking_order + 1) : 1;
    }

    const { error } = await supabase
      .from('daily_participants')
      .update({
        last_participation: participant.getLastParticipation()?.toISOString() || null,
        has_spoken: participant.hasSpoken(),
        speaking_order: speakingOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', participant.id.value);

    if (error) {
      console.error('Erreur lors de la mise à jour du participant quotidien:', error);
      throw error;
    }
  }

  async resetDailyParticipants(): Promise<void> {
    const { error } = await supabase
      .from('daily_participants')
      .update({
        last_participation: null,
        has_spoken: false,
        speaking_order: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', ''); // Update all records

    if (error) {
      console.error('Erreur lors du reset des participants quotidiens:', error);
      throw error;
    }
  }

  async getParticipantById(id: ParticipantId): Promise<Participant | null> {
    const { data, error } = await supabase
      .from('weekly_participants')
      .select('*')
      .eq('id', id.value)
      .single();

    if (error || !data) {
      return null;
    }

    const participant = new Participant(
      new ParticipantId(data.id),
      new ParticipantName(data.name),
      data.chance_percentage
    );
    participant.setPassageCount(data.passage_count);
    return participant;
  }

  async updateChancePercentage(participantId: string, newValue: number): Promise<void> {
    const { error } = await supabase
      .from('weekly_participants')
      .update({
        chance_percentage: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);

    if (error) {
      console.error('Erreur lors de la mise à jour du chance percentage:', error);
      throw error;
    }
  }

  async addToAnimatorHistory(participantId: string): Promise<void> {
    const { error } = await supabase
      .from('animator_history')
      .insert({
        participant_id: participantId,
        date: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
      throw error;
    }

    // Mettre à jour chance_percentage ET passage_count en une seule requête
    const { data: participant } = await supabase
      .from('weekly_participants')
      .select('chance_percentage, passage_count')
      .eq('id', participantId)
      .single();

    if (participant) {
      await supabase
        .from('weekly_participants')
        .update({
          chance_percentage: participant.chance_percentage + 1,  // Incrémenter le diviseur
          passage_count: participant.passage_count + 1,        // Incrémenter les passages
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId);
    }
  }

  async getAnimatorHistory(): Promise<Array<{ id: string; date: string }>> {
    const { data, error } = await supabase
      .from('animator_history')
      .select('participant_id, date')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      return [];
    }

    return data?.map(entry => ({
      id: entry.participant_id,
      date: entry.date
    })) || [];
  }

  async cleanup(): Promise<void> {
    // Pas de nettoyage spécifique nécessaire pour Supabase
    console.log('🧹 Nettoyage Supabase terminé');
  }
} 