import { supabase } from '../../../lib/supabase';
import type { WeeklyParticipant, DailyParticipant, AnimatorHistory } from '../../../lib/supabase';
import { Participant, DailyParticipant as DomainDailyParticipant } from '../../../domain/participant/entities';
import { ParticipantId, ParticipantName } from '../../../domain/participant/valueObjects';
import type { ParticipantRepository } from '../../../domain/participant/repository';
import { INITIAL_PARTICIPANTS } from './migrationHelper';
import { addPhotoUrlColumns } from './migrations/runMigration';
import { generateCuteAnimalPhoto } from '../../../utils/animalPhotos';

export class SupabaseParticipantRepository implements ParticipantRepository {
  
  async initialize(): Promise<void> {
    // Exécuter les migrations nécessaires
    try {
      await addPhotoUrlColumns();
    } catch (error) {
      console.error('Erreur lors des migrations:', error);
    }

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
    try {
      // Préparer les données pour l'insertion
      const weeklyData = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        chance_percentage: p.getChancePercentage(),
        passage_count: 0,
        photo_url: generateCuteAnimalPhoto(p.name.value)
      }));

      const dailyData = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        last_participation: null,
        has_spoken: false,
        speaking_order: null,
        photo_url: generateCuteAnimalPhoto(p.name.value)
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
        row.chance_percentage,
        row.photo_url
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
        row.last_participation ? new Date(row.last_participation) : undefined,
        row.photo_url
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
      data.chance_percentage,
      data.photo_url
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

  async addToAnimatorHistory(participantId: string, date?: Date): Promise<void> {
    // Si aucune date n'est fournie, calculer le prochain lundi
    const animatorDate = date || this.getNextMonday();
    
    const { error } = await supabase
      .from('animator_history')
      .insert({
        participant_id: participantId,
        date: animatorDate.toISOString()
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

  // Nouvelle méthode pour surcharger l'animateur d'une semaine spécifique
  async overrideWeekAnimator(participantId: string, weekDate: Date): Promise<void> {
    // Calculer le lundi de la semaine ciblée
    const mondayOfWeek = this.getMondayOfWeek(weekDate);
    
    // Supprimer l'éventuelle entrée existante pour cette semaine
    await supabase
      .from('animator_history')
      .delete()
      .gte('date', mondayOfWeek.toISOString())
      .lt('date', new Date(mondayOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

    // Ajouter la nouvelle entrée sans incrémenter les compteurs (surcharge manuelle)
    const { error } = await supabase
      .from('animator_history')
      .insert({
        participant_id: participantId,
        date: mondayOfWeek.toISOString()
      });

    if (error) {
      console.error('Erreur lors de la surcharge de l\'animateur:', error);
      throw error;
    }
  }

  // Fonction pour obtenir le lundi d'une semaine donnée
  private getMondayOfWeek(date: Date): Date {
    const day = new Date(date);
    const dayOfWeek = day.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculer les jours jusqu'au lundi
    
    day.setDate(day.getDate() + diff);
    day.setHours(0, 0, 0, 0);
    
    return day;
  }

  // Fonction pour obtenir le lundi de la semaine courante
  getCurrentWeekMonday(): Date {
    return this.getMondayOfWeek(new Date());
  }

  // Fonction pour obtenir le lundi de la semaine prochaine
  getNextWeekMonday(): Date {
    const currentMonday = this.getCurrentWeekMonday();
    return new Date(currentMonday.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  // Fonction pour calculer le prochain lundi
  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
    const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // Si c'est dimanche, le prochain lundi est dans 1 jour
    
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0); // Commencer à minuit
    
    return nextMonday;
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