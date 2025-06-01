// Configuration de la base de données
export const DATABASE_CONFIG = {
  // Configuration Supabase (à remplir avec vos vraies clés)
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  },
  
  // Options
  enableRealTimeSync: true, // Synchronisation temps réel
} 