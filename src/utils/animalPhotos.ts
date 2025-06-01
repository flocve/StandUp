// Collection d'URLs d'animaux mignons depuis différentes APIs gratuites
const CUTE_ANIMAL_APIS = [
  // Chats via Lorem Picsum avec graines spécifiques d'animaux mignons
  'https://picsum.photos/seed/cat1/200/200',
  'https://picsum.photos/seed/cat2/200/200', 
  'https://picsum.photos/seed/cat3/200/200',
  'https://picsum.photos/seed/dog1/200/200',
  'https://picsum.photos/seed/dog2/200/200',
  'https://picsum.photos/seed/dog3/200/200',
  
  // API de chats aléatoires (plus fiable)
  'https://api.thecatapi.com/v1/images/search?format=json&has_breeds=true&order=RANDOM&page=0&limit=1',
  
  // Collection d'animaux mignons prédéfinis
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1581888227599-779811939961?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1611003229186-80e40cd54966?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1606201835225-8a0c49e69fe9?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1559190394-90dae57c6b20?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607670190842-d7c84ad99a7c?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=face'
];

/**
 * Génère un hash simple à partir d'une chaîne de caractères
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir en 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Génère une URL de photo d'animal mignon basée sur le nom du participant
 * Le même nom génèrera toujours la même photo pour la consistance
 */
export function generateCuteAnimalPhoto(participantName: string): string {
  const hash = simpleHash(participantName);
  const index = hash % CUTE_ANIMAL_APIS.length;
  return CUTE_ANIMAL_APIS[index];
}

/**
 * Génère une URL de fallback pour les animaux mignons
 * Utilise une approche différente pour plus de diversité
 */
export function generateFallbackAnimalPhoto(participantName: string): string {
  // Utiliser DiceBear avec un style plus mignon (adventurer, bottts, etc.)
  const styles = ['adventurer', 'avataaars', 'big-smile', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'open-peeps'];
  const hash = simpleHash(participantName);
  const styleIndex = hash % styles.length;
  const style = styles[styleIndex];
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(participantName)}&backgroundColor=transparent`;
}

/**
 * Obtient l'URL de photo à utiliser pour un participant
 * Priorité: photo_url personnalisée > animal mignon > avatar DiceBear
 */
export function getParticipantPhotoUrl(participantName: string, customPhotoUrl?: string): string {
  if (customPhotoUrl && customPhotoUrl.trim()) {
    return customPhotoUrl;
  }
  
  // Générer une photo d'animal mignon
  return generateCuteAnimalPhoto(participantName);
} 