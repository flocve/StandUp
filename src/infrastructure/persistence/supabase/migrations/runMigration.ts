import { supabase } from '../../../../lib/supabase';
import { generateCuteAnimalPhoto } from '../../../../utils/animalPhotos';

export async function addPhotoUrlColumns(): Promise<void> {
  console.log('🔄 Ajout des colonnes photo_url...');

  try {
    // Vérifier si les colonnes existent déjà
    const { data: weeklyColumns } = await supabase
      .from('weekly_participants')
      .select('photo_url')
      .limit(1);

    const { data: dailyColumns } = await supabase
      .from('daily_participants')
      .select('photo_url')
      .limit(1);

    // Si les colonnes n'existent pas, les ajouter
    if (!weeklyColumns || !dailyColumns) {
      console.log('📋 Exécution des commandes SQL...');
      
      // Ajouter photo_url à weekly_participants
      await supabase.rpc('add_photo_url_columns');
      
      console.log('✅ Colonnes photo_url ajoutées avec succès');
    } else {
      console.log('ℹ️ Les colonnes photo_url existent déjà');
    }

    // Mettre à jour les URLs par défaut si elles sont nulles
    await updateDefaultPhotoUrls();

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des colonnes photo_url:', error);
    throw error;
  }
}

async function updateDefaultPhotoUrls(): Promise<void> {
  console.log('🐾 Mise à jour avec des photos d\'animaux mignons...');

  try {
    // Mettre à jour weekly_participants
    const { data: weeklyParticipants } = await supabase
      .from('weekly_participants')
      .select('id, name, photo_url')
      .is('photo_url', null);

    if (weeklyParticipants && weeklyParticipants.length > 0) {
      for (const participant of weeklyParticipants) {
        await supabase
          .from('weekly_participants')
          .update({ 
            photo_url: generateCuteAnimalPhoto(participant.name)
          })
          .eq('id', participant.id);
      }
    }

    // Mettre à jour daily_participants
    const { data: dailyParticipants } = await supabase
      .from('daily_participants')
      .select('id, name, photo_url')
      .is('photo_url', null);

    if (dailyParticipants && dailyParticipants.length > 0) {
      for (const participant of dailyParticipants) {
        await supabase
          .from('daily_participants')
          .update({ 
            photo_url: generateCuteAnimalPhoto(participant.name)
          })
          .eq('id', participant.id);
      }
    }

    console.log('✅ Photos d\'animaux mignons mises à jour');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des photos d\'animaux:', error);
  }
} 