import { supabase } from '../../../../lib/supabase';
import { generateCuteAnimalPhoto } from '../../../../utils/animalPhotos';

export async function addPhotoUrlColumns() {
  try {
    // Tester si les colonnes existent en faisant une requête simple
    const { data: weeklyTest, error: weeklyError } = await supabase
      .from('weekly_participants')
      .select('photo_url')
      .limit(1);

    const { data: dailyTest, error: dailyError } = await supabase
      .from('daily_participants')
      .select('photo_url')
      .limit(1);

    // Si au moins une des requêtes échoue, cela signifie que les colonnes n'existent pas
    if (weeklyError || dailyError) {
      return false;
    } else {
      return true;
    }
    
  } catch (error) {
    return false;
  }
}

export async function updateAnimalPhotos() {
  try {
    // Obtenir tous les participants
    const { data: weeklyParticipants } = await supabase
      .from('weekly_participants')
      .select('id, name');
    
    const { data: dailyParticipants } = await supabase
      .from('daily_participants')
      .select('id, name');

    // Mettre à jour les photos pour les participants hebdomadaires
    if (weeklyParticipants) {
      for (const participant of weeklyParticipants) {
        const photoUrl = generateCuteAnimalPhoto(participant.name);
        await supabase
          .from('weekly_participants')
          .update({ photo_url: photoUrl })
          .eq('id', participant.id);
      }
    }

    // Mettre à jour les photos pour les participants quotidiens
    if (dailyParticipants) {
      for (const participant of dailyParticipants) {
        const photoUrl = generateCuteAnimalPhoto(participant.name);
        await supabase
          .from('daily_participants')
          .update({ photo_url: photoUrl })
          .eq('id', participant.id);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des photos d\'animaux:', error);
  }
} 