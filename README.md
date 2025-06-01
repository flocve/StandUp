# 🎯 Stand-up Meeting Assistant

Application web moderne pour gérer les stand-ups quotidiens et la sélection d'animateurs hebdomadaires avec base de données partagée en temps réel.

## 🌟 Fonctionnalités

### 📅 Daily Stand-up
- **Sélection aléatoire** : Choix équitable du prochain participant
- **Suivi automatique** : Évite les répétitions consécutives
- **Classement visuel** : Affichage de l'ordre de passage
- **Reset quotidien** : Remise à zéro simple

### 🎬 Sélection Animateur
- **Pondération intelligente** : Probabilités ajustables par participant
- **Historique complet** : Suivi des animations précédentes
- **Équilibrage automatique** : Évite les sur-représentations

### 🌐 Base de Données Partagée
- **Supabase** : Base PostgreSQL cloud avec synchronisation temps réel
- **Multi-utilisateurs** : Plusieurs personnes peuvent utiliser simultanément
- **Persistance garantie** : Données sauvées automatiquement
- **Interface de gestion** : Outils d'administration intégrés

## 🚀 Installation

### Prérequis
- Node.js 18+
- Un projet Supabase (gratuit)

### Configuration Supabase

1. **Créer un projet** sur [supabase.com](https://supabase.com)

2. **Configurer les variables d'environnement** :

   **🏠 En local (développement)** :
   ```bash
   # Copiez le fichier template
   cp supabase.config.example .env
   
   # Éditez .env avec vos vraies clés
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-clé-anon
   ```

   **🌐 En production (Vercel, Netlify, etc.)** :
   - Configurez directement les variables dans l'interface de votre plateforme
   - **Vercel** : Settings > Environment Variables
   - **Netlify** : Site settings > Build & deploy > Environment variables
   - **Variables requises** :
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Créer les tables** dans l'SQL Editor Supabase :
# 🎯 Stand-up Meeting Assistant

Application web moderne pour gérer les stand-ups quotidiens et la sélection d'animateurs hebdomadaires avec base de données partagée en temps réel.

## 🌟 Fonctionnalités

### 📅 Daily Stand-up
- **Sélection aléatoire** : Choix équitable du prochain participant
- **Suivi automatique** : Évite les répétitions consécutives
- **Classement visuel** : Affichage de l'ordre de passage
- **Reset quotidien** : Remise à zéro simple

### 🎬 Sélection Animateur
- **Pondération intelligente** : Probabilités ajustables par participant
- **Historique complet** : Suivi des animations précédentes
- **Équilibrage automatique** : Évite les sur-représentations

### 🌐 Base de Données Partagée
- **Supabase** : Base PostgreSQL cloud avec synchronisation temps réel
- **Multi-utilisateurs** : Plusieurs personnes peuvent utiliser simultanément
- **Persistance garantie** : Données sauvées automatiquement
- **Interface de gestion** : Outils d'administration intégrés

## 🚀 Installation

### Prérequis
- Node.js 18+
- Un projet Supabase (gratuit)

### Configuration Supabase

1. **Créer un projet** sur [supabase.com](https://supabase.com)

2. **Configurer les variables d'environnement** :
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Créer les tables** dans l'SQL Editor Supabase :
```sql
-- Tables participants
CREATE TABLE weekly_participants (
  id text PRIMARY KEY,
  name text NOT NULL,
  chance_percentage integer DEFAULT 1,
  passage_count integer DEFAULT 0
);

CREATE TABLE daily_participants (
  id text PRIMARY KEY,
  name text NOT NULL,
  last_participation timestamp,
  has_spoken boolean DEFAULT false,
  speaking_order integer
);

CREATE TABLE animator_history (
  id serial PRIMARY KEY,
  participant_id text REFERENCES weekly_participants(id) ON DELETE CASCADE,
  date timestamp DEFAULT now()
);
```

### Installation du projet

```bash
# Cloner le projet
git clone <repo-url>
cd wheel

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

## 📱 Utilisation

1. **Accéder à l'application** : http://localhost:5174
2. **Configurer les participants** via le bouton ⚙️
3. **Utiliser les onglets** :
   - `Daily Stand-up` : Sélection quotidienne
   - `Sélection Animateur` : Choix hebdomadaire

## 🔧 Administration

L'interface de configuration accessible via ⚙️ permet :

- ➕ **Ajouter/Supprimer** des participants
- 📊 **Visualiser** les données en temps réel
- 🔄 **Réinitialiser** ou nettoyer la base
- 📈 **Statistiques** détaillées

## 🎨 Technologies

- **Frontend** : React + TypeScript + Vite
- **Backend** : Supabase (PostgreSQL + temps réel)
- **Architecture** : Clean Architecture + DDD
- **Styling** : CSS moderne avec animations

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 License

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.

---

## 🧪 Concept du projet

> **Ce projet est une expérimentation complète sur le développement par intelligence artificielle.**

L'objectif est de démontrer **ce qu'il est possible de réaliser à 100% via une IA**, sans intervention humaine.

- 📐 **Idée, conception, structure, code, design, README** : tout a été généré par **Claude 4 Sonnet**, via l'éditeur **Cursor**.
- 🎯 L'humain s'est contenté de formuler les intentions générales — l'IA a tout produit seule.

Ce projet est donc autant une application fonctionnelle qu'une **preuve de concept**.

---

## 🚀 Fonctionnalités

- **🎯 Sélection aléatoire d'un participant** pour intervenir durant le stand-up quotidien.
- **📅 Désignation hebdomadaire de l'animateur**, avec un système de pondération :
  - Moins tu as animé récemment, plus tu as de chances d'être choisi.
  - Une équité dynamique est maintenue au fil des semaines.

---

## ⚙️ Stack technique

- **Frontend** : [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styles** : Tailwind CSS 
- **Stockage** : LocalStorage

---

## 🛠️ Installation

```bash
git clone https://github.com/flocve/StandUp.git
cd StandUp
npm install
npm run dev