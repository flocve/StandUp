# 🔐 Guide de Sécurité

## ⚠️ Variables d'Environnement

### 🚫 Ce qu'il ne faut JAMAIS faire

```bash
# ❌ DANGER : Ne JAMAIS committer ces fichiers
.env
.env.local
.env.production

# ❌ DANGER : Ne JAMAIS hardcoder les clés dans le code
const supabaseUrl = "https://mon-projet.supabase.co" // NON !
const supabaseKey = "eyJhbGciOiJIUzI..." // NON !
```

### ✅ Ce qu'il faut faire

```bash
# ✅ SÉCURISÉ : Utiliser les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

# ✅ SÉCURISÉ : Fichier .env local (ignoré par Git)
echo "*.env*" >> .gitignore
```

## 🛡️ Protection des Clés

### En Local
- Fichier `.env` à la racine (JAMAIS committé)
- Template `supabase.config.example` pour les nouveaux développeurs
- `.gitignore` configuré correctement

### En Production
- Variables configurées directement sur la plateforme (Vercel, Netlify)
- Pas de fichiers `.env` sur le serveur
- Logs sans exposition des clés

## 🚨 En cas de Compromission

Si vous avez accidentellement exposé vos clés :

1. **Immédiatement** :
   ```bash
   # Supprimer le fichier du repository
   git rm .env
   git commit -m "Remove exposed env file"
   git push
   ```

2. **Régénérer les clés** dans Supabase :
   - Dashboard → Settings → API
   - Régénérer la clé anon
   - Mettre à jour partout

3. **Nettoyer l'historique Git** (si nécessaire) :
   ```bash
   # Attention : réécrit l'historique !
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

## 🔍 Audit de Sécurité

### Vérifications Régulières

```bash
# Vérifier que .env n'est pas tracké
git ls-files | grep -i env

# Vérifier .gitignore
cat .gitignore | grep env

# Vérifier l'historique Git (recherche de clés)
git log --all --grep="supabase" -p
```

### Monitoring

- ✅ Logs Supabase pour détecter des accès anormaux
- ✅ Alerts sur usage inhabituel
- ✅ Rotation régulière des clés (recommandé: tous les 6 mois)

## 📋 Checklist Sécurité

### Avant Commit
- [ ] Aucun fichier `.env*` dans `git status`
- [ ] Aucune clé hardcodée dans le code
- [ ] `.gitignore` à jour

### Avant Déploiement
- [ ] Variables configurées sur la plateforme
- [ ] Test de connexion Supabase en production
- [ ] Logs sans exposition de clés

### Périodique
- [ ] Audit des accès Supabase
- [ ] Rotation des clés (6 mois)
- [ ] Vérification des permissions

## 🎯 Bonnes Pratiques

1. **Principle of Least Privilege** : Utilisez uniquement les permissions nécessaires
2. **Environment Separation** : Clés différentes pour dev/staging/prod
3. **Monitoring** : Surveillez les accès et erreurs
4. **Documentation** : Partagez les bonnes pratiques avec l'équipe
5. **Backup** : Gardez une copie sécurisée des configurations importantes 