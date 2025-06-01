import { supabase } from '../../../../lib/supabase';
import { generateCuteAnimalPhoto } from '../../../../utils/animalPhotos';

export async function addPhotoUrlColumns(): Promise<void> {
  console.log('🔄 Vérification des colonnes photo_url...');

  try {
    // Essayer de sélectionner les colonnes photo_url pour vérifier qu'elles existent
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('weekly_participants')
      .select('photo_url')
      .limit(1);

    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_participants')
      .select('photo_url')
      .limit(1);

    // Si il y a des erreurs, cela signifie que les colonnes n'existent pas
    if (weeklyError || dailyError) {
      console.log('❌ Les colonnes photo_url n\'existent pas encore');
      console.log('📝 Pour ajouter les colonnes photo_url, exécutez ce SQL dans Supabase:');
      console.log('   ALTER TABLE weekly_participants ADD COLUMN photo_url TEXT;');
      console.log('   ALTER TABLE daily_participants ADD COLUMN photo_url TEXT;');
      console.log('ℹ️ L\'application continuera de fonctionner sans les photos');
      
      if (weeklyError) {
        console.log('   Erreur weekly_participants:', weeklyError.message);
      }
      if (dailyError) {
        console.log('   Erreur daily_participants:', dailyError.message);
      }
      return;
    }

    console.log('✅ Les colonnes photo_url existent déjà');

    // Mettre à jour les URLs par défaut si elles sont nulles
    await updateDefaultPhotoUrls();

  } catch (error) {
    console.log('❌ Erreur lors de la vérification des colonnes photo_url:', error);
    console.log('📝 Pour ajouter les colonnes photo_url, exécutez ce SQL dans Supabase:');
    console.log('   ALTER TABLE weekly_participants ADD COLUMN photo_url TEXT;');
    console.log('   ALTER TABLE daily_participants ADD COLUMN photo_url TEXT;');
    console.log('ℹ️ L\'application continuera de fonctionner sans les photos');
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