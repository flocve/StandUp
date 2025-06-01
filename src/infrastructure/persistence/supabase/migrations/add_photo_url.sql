-- Migration: Ajouter les colonnes photo_url aux tables des participants
-- Date: 2024
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Ajouter photo_url à la table weekly_participants (seulement si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'weekly_participants' 
        AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE weekly_participants ADD COLUMN photo_url TEXT;
        RAISE NOTICE 'Colonne photo_url ajoutée à weekly_participants';
    ELSE
        RAISE NOTICE 'Colonne photo_url existe déjà dans weekly_participants';
    END IF;
END $$;

-- Ajouter photo_url à la table daily_participants (seulement si elle n'existe pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'daily_participants' 
        AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE daily_participants ADD COLUMN photo_url TEXT;
        RAISE NOTICE 'Colonne photo_url ajoutée à daily_participants';
    ELSE
        RAISE NOTICE 'Colonne photo_url existe déjà dans daily_participants';
    END IF;
END $$;

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN weekly_participants.photo_url IS 'URL de la photo du participant';
COMMENT ON COLUMN daily_participants.photo_url IS 'URL de la photo du participant';

-- Ajouter quelques URLs par défaut pour les tests (optionnel)
UPDATE weekly_participants 
SET photo_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || name 
WHERE photo_url IS NULL;

UPDATE daily_participants 
SET photo_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || name 
WHERE photo_url IS NULL;

-- Message de confirmation
SELECT 'Migration des colonnes photo_url terminée avec succès!' AS message; 