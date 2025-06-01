# 🚀 Guide de Déploiement

## 🔐 Variables d'Environnement

### ⚠️ Sécurité Importante

Le fichier `.env` contient vos clés secrètes Supabase et **NE DOIT JAMAIS** être committé sur GitHub public.

✅ **Ce qui est sûr** :
- Fichier `.env` en local (ignoré par Git)
- Variables configurées directement sur la plateforme de déploiement

❌ **Ce qui est dangereux** :
- Committer `.env` sur GitHub
- Hardcoder les clés dans le code source

## 🏠 Configuration Locale

```bash
# 1. Copiez le template
cp supabase.config.example .env

# 2. Éditez .env avec vos vraies valeurs
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Vérifiez que .env est dans .gitignore (déjà fait)
```

## 🌐 Déploiement Production

### Vercel (Recommandé)

1. **Connecter votre repository GitHub** :
   ```bash
   # Push votre code (sans .env)
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Configurer les variables** dans Vercel Dashboard :
   - Allez sur vercel.com/dashboard
   - Sélectionnez votre projet
   - **Settings** → **Environment Variables**
   - Ajoutez :
     ```
     VITE_SUPABASE_URL = https://votre-projet.supabase.co
     VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

3. **Redéployer** :
   - Vercel redéploie automatiquement après configuration

### Netlify

1. **Build et déploiement** :
   ```bash
   # Build local
   npm run build
   
   # Drag & drop du dossier dist/ sur netlify.com
   # OU connecter GitHub repository
   ```

2. **Variables d'environnement** :
   - **Site settings** → **Build & deploy** → **Environment variables**
   - Ajoutez les mêmes variables que Vercel

### Autres Plateformes

| Plateforme | Configuration Variables |
|------------|------------------------|
| **Railway** | Settings → Environment |
| **Render** | Environment → Environment Variables |
| **Heroku** | Settings → Config Vars |
| **DigitalOcean App** | App → Settings → App-Level Environment Variables |

## 🔍 Vérification du Déploiement

### Test des Variables

Ajoutez temporairement dans votre code (puis retirez) :

```javascript
// TEMPORAIRE : pour tester les variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key présente:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OUI' : 'NON');
```

### Diagnostic Production

1. **Ouvrez la console développeur** sur votre site déployé
2. **Exécutez** :
   ```javascript
   supabaseUtils.diagnosticComplete()
   ```
3. **Vérifiez** :
   - ✅ Connexion Supabase : OK
   - ✅ Tables accessibles
   - ✅ Données chargées

## 🔧 Dépannage

### Erreur "Cannot find module supabase"

**Solution** : Variables mal configurées
```bash
# Vérifiez dans la console :
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

### Erreur 401 Unauthorized

**Solution** : Clé anon invalide
- Re-copiez la clé depuis Supabase Dashboard
- Vérifiez qu'il n'y a pas d'espaces ou caractères cachés

### Variables non chargées

**Solution** : Préfixe manquant
- ❌ `SUPABASE_URL` 
- ✅ `VITE_SUPABASE_URL` (avec préfixe VITE_)

## 📚 Ressources

- [Documentation Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentation Netlify - Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Supabase - Getting Started](https://supabase.com/docs/guides/getting-started)

## 🔒 Bonnes Pratiques

1. **Jamais** de clés dans le code source
2. **Toujours** utiliser le préfixe `VITE_` pour Vite
3. **Régénérer** les clés si elles sont exposées
4. **Tester** en production après chaque déploiement
5. **Surveiller** les logs d'erreur Supabase 