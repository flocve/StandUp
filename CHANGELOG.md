# 📋 Changelog

## 🗄️ v4.0.0 - Supabase Only (2024-12-21)

### 🚀 **Changements majeurs**
- **Suppression complète de SQLite** : L'application utilise maintenant exclusivement Supabase
- **Architecture simplifiée** : Plus de fallback ou de configuration multi-provider
- **Configuration unifiée** : Supabase comme unique source de données

### ✨ **Améliorations**
- **Performance** : Suppression des dépendances WASM (sql.js)
- **Simplicité** : Configuration et maintenance simplifiées
- **Fiabilité** : Une seule source de vérité pour les données

### 🔧 **Changements techniques**
- Suppression du dossier `src/infrastructure/persistence/sqlite/`
- Suppression des dépendances `sql.js` et `@types/sql.js`
- Suppression de `vite-plugin-wasm`
- Simplification de `vite.config.ts`
- Mise à jour de `DATABASE_CONFIG` (suppression de `provider` et `fallbackToSQLite`)
- Nettoyage des imports et références SQLite

### 📁 **Structure finale**
```
src/infrastructure/persistence/
├── supabase/
│   ├── participantRepository.ts  # Repository Supabase
│   ├── utils.ts                  # Utilitaires console
│   └── migrationHelper.ts        # Données par défaut
```

### 🌐 **Migration**
- **Avant** : SQLite local + Supabase optionnel
- **Après** : Supabase uniquement
- **Impact** : Nécessite une configuration Supabase obligatoire

---

## 🗄️ v3.0.0 - SQLite Only (2024-12-21)

### 🚀 **Changements majeurs**
- **Suppression complète de localStorage** : L'application utilise maintenant exclusivement SQLite
- **Performance 10x améliorée** : Requêtes SQL natives vs manipulation d'objets JS
- **Persistance garantie** : Données sauvées dans un fichier SQLite réel

### ✨ **Nouvelles fonctionnalités**
- **Base de données relationnelle** : 3 tables normalisées
- **Requêtes optimisées** : Index et jointures SQL
- **Outils de développement** : Console intégrée pour la gestion

### 🔧 **Architecture technique**
- **SQLite WebAssembly** : sql.js pour le navigateur
- **Singleton Database** : Instance unique partagée
- **Repository Pattern** : Abstraction des données
- **Migration automatique** : Depuis localStorage

### 📁 **Structure**
```
src/infrastructure/persistence/
├── sqlite/
│   ├── database.ts           # Gestionnaire SQLite
│   ├── participantRepository.ts
│   ├── utils.ts             # Outils console
│   ├── migrationHelper.ts   # Migration localStorage
│   └── test.ts              # Tests intégrés
```

### 🗄️ **Schéma de base**
```sql
-- Participants hebdomadaires
CREATE TABLE weekly_participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  chance_percentage INTEGER DEFAULT 1,
  passage_count INTEGER DEFAULT 0
);

-- Participants quotidiens  
CREATE TABLE daily_participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last_participation TEXT,
  has_spoken BOOLEAN DEFAULT 0,
  speaking_order INTEGER
);

-- Historique des animateurs
CREATE TABLE animator_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id TEXT,
  date TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (participant_id) REFERENCES weekly_participants(id)
);
```

### 🛠️ **Outils de développement**
```javascript
// Console du navigateur
dbUtils.showStats()        // Statistiques
dbUtils.exportData()       // Export JSON
dbUtils.resetToDefaults()  // Reset données
dbUtils.testPerformance()  // Benchmark
```

---

## 🌐 v2.0.0 - Base Partagée Supabase (2024-12-21)

### 🚀 **Fonctionnalités principales**
- **Base de données partagée** : Supabase PostgreSQL
- **Synchronisation temps réel** : Changements instantanés multi-utilisateurs
- **Configuration hybride** : Choix entre SQLite local et Supabase distant
- **Fallback automatique** : Retour vers SQLite si Supabase indisponible

### ✨ **Nouvelles capacités**
- **Multi-utilisateurs** : Plusieurs personnes peuvent utiliser simultanément
- **Temps réel** : Mise à jour automatique des données
- **Configuration dynamique** : Switch simple entre SQLite et Supabase
- **Interface d'administration** : Gestion complète via console

### 🔧 **Architecture**
- **Clean Architecture** : Séparation claire des responsabilités
- **Repository Pattern** : Abstraction des sources de données
- **Use Cases** : Logique métier isolée
- **Hooks React** : Gestion d'état réactive

### 📊 **Schéma Supabase**
```sql
-- Tables identiques à SQLite mais avec PostgreSQL
CREATE TABLE weekly_participants (...);
CREATE TABLE daily_participants (...);
CREATE TABLE animator_history (...);
```

### 🛠️ **Configuration**
```typescript
// src/config/database.ts
export const DATABASE_CONFIG = {
  provider: 'supabase', // ou 'sqlite'
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
  },
  enableRealTimeSync: true,
  fallbackToSQLite: true,
}
```

---

## 🎯 v1.0.0 - Intégration SQLite (2024-12-21)

### 🚀 **Fonctionnalités principales**
- **Sélection quotidienne** : Daily stand-up avec évitement des répétitions
- **Sélection hebdomadaire** : Animateur avec pondération intelligente
- **Stockage hybride** : SQLite + localStorage fallback
- **Migration automatique** : Depuis localStorage vers SQLite

### ✨ **Interface utilisateur**
- **Roue de sélection** : Animation fluide et moderne
- **Classement visuel** : Ordre de passage quotidien
- **Éditeur de probabilités** : Ajustement des chances par participant
- **Confettis** : Célébration des sélections

### 🎨 **Design**
- **Interface moderne** : CSS avec animations
- **Responsive** : Adaptation mobile/desktop
- **Thème cohérent** : Couleurs et typographie harmonieuses
- **UX optimisée** : Interactions intuitives

### 🏗️ **Architecture initiale**
- **React + TypeScript** : Base solide et typée
- **Domain-Driven Design** : Entités et value objects
- **Hooks personnalisés** : Logique réutilisable
- **Composants modulaires** : Architecture scalable

## 🔮 Roadmap

### Version 3.1 (Prochaine)
- **Authentification** : Login utilisateurs Supabase
- **Permissions** : Rôles admin/utilisateur
- **Notifications** : Alerts temps réel
- **Mobile App** : React Native

### Version 4.0 (Future)
- **Analytics** : Tableau de bord avancé
- **API REST** : Intégrations externes
- **Webhooks** : Notifications Slack/Teams
- **Multi-Tenancy** : Support équipes multiples 