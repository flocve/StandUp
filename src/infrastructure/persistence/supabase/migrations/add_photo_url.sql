-- Migration: Ajouter les colonnes photo_url aux tables des participants
-- Date: 2024

-- Ajouter photo_url à la table weekly_participants
ALTER TABLE weekly_participants
ADD COLUMN photo_url TEXT;

-- Ajouter photo_url à la table daily_participants
ALTER TABLE daily_participants  
ADD COLUMN photo_url TEXT;

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN weekly_participants.photo_url IS 'URL de la photo du participant';
COMMENT ON COLUMN daily_participants.photo_url IS 'URL de la photo du participant';

-- Ajouter quelques URLs par défaut pour les tests (optionnel)
UPDATE weekly_participants SET photo_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || name WHERE photo_url IS NULL;
UPDATE daily_participants SET photo_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || name WHERE photo_url IS NULL; 