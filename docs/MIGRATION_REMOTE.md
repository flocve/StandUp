# 🚀 Migration vers Base Distante

## 📖 Vue d'Ensemble

Cette version **3.0.0** introduit le support d'une base de données partagée via **Supabase**, permettant la synchronisation temps réel entre plusieurs utilisateurs.

## 🔄 Avant/Après

### Avant (v2.x)
- 💾 **SQLite local** (localStorage)
- 👤 **Usage individuel** par navigateur
- 🔄 **Pas de synchronisation** entre utilisateurs
- 💡 **Données isolées** par session

### Après (v3.0)
- 🌐 **Supabase** ou SQLite local (au choix)
- 👥 **Usage multi-utilisateurs** en temps réel
- ⚡ **Synchronisation instantanée** entre clients
- 🔗 **Données partagées** globalement

---

## 🛠️ Options de Migration

### Option 1: Rester en Local (Aucun Changement)
Si vous utilisez l'app individuellement, **rien à faire** !

La configuration par défaut reste `sqlite` local.

### Option 2: Activer le Partage (Recommandé équipes)
Pour partager entre plusieurs utilisateurs :

1. **Créer compte Supabase** (gratuit)
2. **Configurer base** avec script SQL
3. **Modifier configuration** app
4. **Partager URL** avec équipe

---

## 🚶‍♂️ Guide Étape par Étape

### 1. Backup des Données Actuelles (Optionnel)

Ouvrez la console (F12) et exécutez :
```javascript
// Sauvegarder les données actuelles
localStorage.setItem('backup_wheel_data', JSON.stringify({
  participants: localStorage.getItem('wheel_participants'),
  history: localStorage.getItem('wheel_history'),
  daily: localStorage.getItem('wheel_daily')
}));

console.log('✅ Backup créé dans localStorage["backup_wheel_data"]');
```

### 2. Setup Supabase

#### A. Créer le Projet
1. Aller sur [supabase.com](https://supabase.com)
2. Sign up → New Project
3. Nom: `wheel-stand-up` ou similaire
4. Région: Choisir la plus proche de votre équipe

#### B. Configurer la Base
1. Aller dans **SQL Editor**
2. Copier le contenu de `supabase-setup.sql`
3. Coller et cliquer **Run**
4. Vérifier dans **Table Editor** que les 3 tables sont créées

#### C. Récupérer les Clés
1. **Settings** → **API**
2. Copier **Project URL**
3. Copier **anon/public key**

### 3. Configuration Locale

#### A. Variables d'Environnement
Créer fichier `.env` à la racine :
```env
REACT_APP_SUPABASE_URL=https://votre-projet-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### B. Activer Supabase
Dans `src/config/database.ts` :
```typescript
export const DATABASE_CONFIG = {
  provider: 'supabase', // ← Changer de 'sqlite' vers 'supabase'
  // ...
};
```

### 4. Test & Validation

```bash
npm start
```

Vérifications :
- ✅ En-tête affiche **"🌐 Supabase (Base partagée)"**
- ✅ Console (F12) : `testSupabase()` retourne success
- ✅ Icône **🔄 Temps réel actif** visible

---

## 🔄 Migration des Données

### Automatique (Nouveaux Participants)
Le système initialise automatiquement avec participants par défaut.

### Manuelle (Données Existantes)
Si vous voulez migrer vos données actuelles :

1. **Exporter depuis SQLite local** :
```javascript
// Dans la console de l'ancienne version
dbUtils.listParticipants(); // Noter les participants
dbUtils.showStats(); // Noter les statistiques
```

2. **Importer dans Supabase** :
```javascript
// Dans la nouvelle version (Supabase)
dbUtils.addParticipant('Nom Participant');
dbUtils.updateChancePercentage('id', nouveauPourcentage);
```

---

## 🔧 Dépannage

### Problème: "Failed to fetch"
```typescript
// Vérifier URL Supabase
console.log(process.env.REACT_APP_SUPABASE_URL);
```

### Problème: "Invalid API key" 
```typescript
// Vérifier clé API
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### Problème: Tables non trouvées
- Exécuter à nouveau `supabase-setup.sql`
- Vérifier dans Table Editor Supabase

### Fallback automatique
Si Supabase échoue, l'app revient automatiquement en SQLite local.

---

## 🎯 Retour en Arrière

Si besoin de revenir au mode local :

```typescript
// src/config/database.ts
export const DATABASE_CONFIG = {
  provider: 'sqlite', // ← Revenir à sqlite
  // ...
};
```

Les données locales sont préservées ! 💾

---

## 🌟 Bénéfices de la Migration

### Pour les Équipes
- **Synchronisation temps réel** des sélections
- **Historique partagé** visible par tous
- **État cohérent** entre tous les membres
- **Accès multi-appareils** (bureau, mobile, etc.)

### Pour les Administrateurs
- **Dashboard Supabase** pour monitoring
- **Backup automatique** des données
- **Logs d'activité** détaillés
- **Scalabilité** automatique

### Performance
- **Latence** : ~100-200ms selon région
- **Disponibilité** : 99.9% (SLA Supabase)
- **Capacité** : 500MB gratuits (largement suffisant)

---

## 📞 Support

### Auto-diagnostic
```javascript
// Console F12
testSupabase(); // Test complet Supabase
dbUtils.diagnosticComplete(); // État de la base
```

### Ressources
- 📖 **Guide complet** : `docs/REMOTE_DATABASE.md`
- ⚡ **Setup rapide** : `docs/QUICK_START.md`
- 🐛 **Dépannage** : `docs/TROUBLESHOOTING.md`

### Contact
- **Issues GitHub** pour bugs
- **Discussions** pour questions
- **Console logs** pour diagnostic

---

## 🎉 Félicitations !

Votre équipe peut maintenant utiliser la roue en **temps réel synchronisé** ! 

Chaque membre verra instantanément les sélections et modifications des autres. Perfect pour les daily stand-ups distribués ! 🌍 