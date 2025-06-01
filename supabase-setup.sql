-- Script SQL pour configurer Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des participants hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  chance_percentage INTEGER NOT NULL DEFAULT 1,
  passage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants quotidiens
CREATE TABLE IF NOT EXISTS daily_participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  last_participation TIMESTAMP WITH TIME ZONE,
  has_spoken BOOLEAN NOT NULL DEFAULT FALSE,
  speaking_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de l'historique des animateurs
CREATE TABLE IF NOT EXISTS animator_history (
  id SERIAL PRIMARY KEY,
  participant_id TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (participant_id) REFERENCES weekly_participants (id) ON DELETE CASCADE
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_animator_history_participant_id 
ON animator_history (participant_id);

CREATE INDEX IF NOT EXISTS idx_animator_history_date 
ON animator_history (date DESC);

CREATE INDEX IF NOT EXISTS idx_daily_participants_speaking_order 
ON daily_participants (speaking_order);

CREATE INDEX IF NOT EXISTS idx_weekly_participants_name 
ON weekly_participants (name);

CREATE INDEX IF NOT EXISTS idx_daily_participants_name 
ON daily_participants (name);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_weekly_participants_updated_at 
  BEFORE UPDATE ON weekly_participants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_participants_updated_at 
  BEFORE UPDATE ON daily_participants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politique de sécurité RLS (Row Level Security)
-- Permettre la lecture et l'écriture à tous (pour une app simple)
-- En production, vous devriez configurer une authentification plus stricte

ALTER TABLE weekly_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE animator_history ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre tout (à adapter selon vos besoins de sécurité)
CREATE POLICY "Enable all access for weekly_participants" 
ON weekly_participants FOR ALL USING (true);

CREATE POLICY "Enable all access for daily_participants" 
ON daily_participants FOR ALL USING (true);

CREATE POLICY "Enable all access for animator_history" 
ON animator_history FOR ALL USING (true);

-- Vue pour les statistiques
CREATE OR REPLACE VIEW participant_stats AS
SELECT 
  wp.id,
  wp.name,
  wp.chance_percentage,
  wp.passage_count,
  dp.has_spoken,
  dp.speaking_order,
  dp.last_participation,
  COUNT(ah.id) as total_animations
FROM weekly_participants wp
LEFT JOIN daily_participants dp ON wp.id = dp.id
LEFT JOIN animator_history ah ON wp.id = ah.participant_id
GROUP BY wp.id, wp.name, wp.chance_percentage, wp.passage_count, 
         dp.has_spoken, dp.speaking_order, dp.last_participation
ORDER BY wp.name; 