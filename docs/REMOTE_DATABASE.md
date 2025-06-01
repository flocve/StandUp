# 🌐 Base de Données Distante Partagée

Ce guide explique comment configurer une base de données partagée pour plusieurs utilisateurs.

## 🚀 Option 1: Supabase (Recommandée)

Supabase est la solution la plus simple pour une base PostgreSQL hébergée.

### Étapes de Configuration

#### 1. Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Donnez un nom à votre projet (ex: "wheel-app")
6. Choisissez une région proche de vos utilisateurs
7. Générez un mot de passe sécurisé
8. Cliquez sur "Create new project"

#### 2. Configurer la Base de Données

1. Dans le dashboard Supabase, allez dans "SQL Editor"
2. Copiez-collez le contenu du fichier `supabase-setup.sql`
3. Cliquez sur "Run" pour exécuter le script
4. Vérifiez que les tables sont créées dans l'onglet "Table Editor"

#### 3. Récupérer les Clés d'API

1. Allez dans "Settings" > "API"
2. Copiez l'URL du projet (Project URL)
3. Copiez la clé "anon/public" (API Key)

#### 4. Configurer l'Application

1. Créez un fichier `.env` à la racine du projet :
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Modifiez `src/config/database.ts` :
```typescript
export const DATABASE_CONFIG = {
  provider: 'supabase', // Changer de 'sqlite' vers 'supabase'
  // ... reste de la config
};
```

3. Relancez l'application :
```bash
npm start
```

### Avantages de Supabase

✅ **Setup ultra-rapide** - Prêt en 10 minutes
✅ **Temps réel** - Synchronisation automatique entre utilisateurs  
✅ **Sécurisé** - Authentification et RLS intégrés
✅ **Gratuit** - 500MB de stockage inclus
✅ **Interface admin** - Dashboard pour gérer les données
✅ **Backup automatique** - Sauvegarde quotidienne

---

## 🛠️ Option 2: Backend Custom (Avancé)

Pour plus de contrôle, vous pouvez créer votre propre serveur.

### Technologies Suggérées

- **Backend**: Node.js + Express
- **Base**: PostgreSQL ou SQLite
- **ORM**: Prisma ou TypeORM
- **Temps réel**: Socket.io
- **Hosting**: Railway, Heroku, DigitalOcean

### Architecture Simplifiée

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │───▶│   Express API   │───▶│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │   Socket.io     │
                       │ (Temps réel)    │
                       └─────────────────┘
```

### Points Clés

- API REST pour CRUD operations
- WebSockets pour synchronisation temps réel
- Authentification JWT
- Rate limiting
- Validation des données
- Logs et monitoring

---

## 🔄 Migration des Données

L'application gère automatiquement la migration :

1. **SQLite → Supabase** : Les données actuelles seront perdues (export manuel nécessaire)
2. **Fallback** : Si Supabase échoue, retour automatique vers SQLite
3. **Configuration** : Switch simple via `DATABASE_CONFIG.provider`

---

## 🏗️ Fonctionnalités Temps Réel

Avec Supabase, vous bénéficiez automatiquement de :

- **Synchronisation en temps réel** entre tous les utilisateurs
- **Notifications** quand quelqu'un utilise la roue
- **État partagé** des participants
- **Historique synchronisé**

### Exemple d'Utilisation

```typescript
// Écouter les changements en temps réel
supabase
  .channel('participants')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'weekly_participants' },
    (payload) => {
      console.log('Changement détecté:', payload);
      // Recharger les données automatiquement
    }
  )
  .subscribe();
```

---

## 🔐 Sécurité

### Supabase (Configuré automatiquement)

- RLS (Row Level Security) activé
- Clés API avec scope limité
- HTTPS forcé
- Rate limiting intégré

### Recommandations

1. **Ne jamais exposer la clé service** (seulement anon/public)
2. **Configurer l'authentification** pour production
3. **Limiter les accès par domaine** dans Supabase
4. **Monitoring des requêtes** suspectes

---

## 📊 Monitoring & Maintenance

### Supabase Dashboard

- **Métriques en temps réel** (requêtes, utilisateurs, stockage)
- **Logs détaillés** des API calls
- **Backup automatique** configurable
- **Alertes email** pour problèmes

### Commandes Utiles

```bash
# Vérifier la connexion
npm run test:supabase

# Export des données (backup)
npm run export:data

# Reset de la base
npm run reset:database
```

---

## 🚨 Dépannage

### Erreurs Courantes

1. **"Failed to fetch"** → Vérifiez l'URL Supabase
2. **"Invalid API key"** → Vérifiez la clé dans .env
3. **"Row Level Security"** → Vérifiez les policies SQL
4. **"CORS error"** → Configurez les domaines autorisés

### Logs

Les logs sont disponibles dans :
- Console navigateur (F12)
- Dashboard Supabase > Logs
- Network tab pour debug API

---

## 💡 Conseils de Performance

### Optimisations

1. **Pagination** pour grandes listes
2. **Cache local** avec React Query
3. **Batch operations** pour multiples updates
4. **Index optimisés** (déjà configurés)

### Limites Gratuites Supabase

- **500 MB** de stockage
- **2 GB** de bande passante/mois
- **50,000 requêtes** par mois
- **2 projets actifs**

Pour cette app, largement suffisant ! 🎯 