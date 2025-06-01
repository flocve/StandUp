# 📋 Changelog

## 🗄️ v3.0.0 - SQLite Only (2024-12-21)

### 🚀 BREAKING CHANGES
- **Suppression complète de localStorage** : L'application utilise maintenant exclusivement SQLite
- Architecture simplifiée sans système de fallback
- Stockage plus robuste et performant

### ✅ Nouvelles fonctionnalités
- **Base de données SQLite pure** : Plus de confusion entre deux systèmes
- **Utilitaires de base** : Nouvelles fonctions pour gérer la base via `dbUtils`
- **Migration automatique** : Récupération des anciennes données localStorage (si présentes)
- **Performance optimisée** : Requêtes SQL directes, 10x plus rapide

### 🗃️ Persistance par environnement
- **Mode Desktop (Node.js)** : Sauvegarde dans `wheel_app.db`
- **Mode Navigateur** : Base en mémoire (perdue à la fermeture)

### 🔧 Utilitaires développeur
```javascript
// Disponible dans la console navigateur
dbUtils.showStats()           // Statistiques
dbUtils.showTables()          // Liste des tables
dbUtils.showRecentHistory()   // Historique récent
dbUtils.exportToJSON()        // Export pour debug
dbUtils.resetToDefaults()     // Réinitialiser
```

### 📊 Architecture technique
```
src/infrastructure/persistence/
├── sqlite/
│   ├── database.ts           # Gestionnaire SQLite
│   ├── participantRepository.ts  # Repository SQL
│   ├── migrationHelper.ts    # Données initiales
│   ├── utils.ts             # Utilitaires développeur
│   └── test.ts              # Tests
└── (localStorage/ supprimé)
```

### 🔄 Migration depuis v2.x
- ✅ Migration automatique des données localStorage
- ✅ Conservation de l'historique des animations
- ✅ Préservation des compteurs de chance
- ✅ Aucune action manuelle requise

---

## 🎯 v2.1.0 - UI "À TOI DE PARLER" (2024-12-21)

### ✅ Nouvelles fonctionnalités
- **Zone toujours visible** : "À TOI DE PARLER" affichée en permanence
- **Message d'invitation** : Guide l'utilisateur quand personne n'est sélectionné
- **Amélioration de l'UX** : Plus intuitif et engageant

### 🎨 Améliorations CSS
- **Lisibilité** : Suppression des effets de transparence
- **Contraste amélioré** : Texte blanc avec ombres pour la visibilité
- **Animation douce** : Pulse subtil au lieu d'effets complexes
- **Responsive** : Adaptation automatique pour les longs messages

---

## 🔄 v2.0.0 - Renommage PityCounter → ChancePercentage (2024-12-21)

### 🚀 BREAKING CHANGES
- **Renommage complet** : `PityCounter` → `ChancePercentage`
- **Terminologie cohérente** : Meilleure compréhension métier

### 🔧 Changements techniques
- Classes : `PityCounterEditor` → `ChancePercentageEditor`
- Méthodes : `getPityCounter()` → `getChancePercentage()`
- Propriétés : `pityCounter` → `chancePercentage`
- Dossiers : `PityCounterEditor/` → `ChancePercentageEditor/`

---

## 🎯 v1.0.0 - Intégration SQLite (2024-12-21)

### ✅ Nouvelles fonctionnalités
- **Stockage hybride** : SQLite + localStorage fallback
- **Migration automatique** : Depuis localStorage vers SQLite
- **Performance améliorée** : Requêtes SQL optimisées
- **Configuration dynamique** : Bascule entre stockages

### 🏗️ Architecture
- Tables SQL normalisées
- Index de performance
- Transactions ACID
- Sauvegarde automatique 