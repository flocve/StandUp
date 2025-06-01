# 🚀 Guide Rapide - Base Partagée

## ⚡ Configuration Supabase (10 minutes)

### 1. Créer le projet Supabase

1. **Compte** : [supabase.com](https://supabase.com) → Sign up
2. **Projet** : New Project → Nom: "wheel-app"
3. **Base** : Copier le script `supabase-setup.sql` dans SQL Editor → Run

### 2. Récupérer les clés

Dans **Settings** > **API** :
- **URL** : `https://xxxxxx.supabase.co`
- **Key** : `eyJhbGci...` (anon/public)

### 3. Configuration locale

Créer `.env` :
```env
REACT_APP_SUPABASE_URL=https://votre-projet.supabase.co
REACT_APP_SUPABASE_ANON_KEY=votre-clé-anon
```

Dans `src/config/database.ts` :
```typescript
provider: 'supabase', // ← Changer ici
```

### 4. Test

```bash
npm start
```

Vérifiez : **"🌐 Supabase (Base partagée)"** dans l'en-tête.

---

## ✅ Fonctionnalités

✨ **Synchronisation temps réel** entre utilisateurs  
✨ **Données persistantes** (survit aux rechargements)  
✨ **Partage multi-appareils** instantané  
✨ **Fallback SQLite** automatique  

---

## 🔄 Retour à SQLite

Dans `src/config/database.ts` :
```typescript
provider: 'sqlite', // ← Revenir en arrière
```

---

## 🎯 Usage Partagé

1. **Un utilisateur** lance la roue → Tous voient le résultat
2. **Modifications** des % → Synchronisées partout
3. **Historique** partagé en temps réel
4. **État quotidien** synchronisé

Perfect pour les équipes distribuées ! 🌍 