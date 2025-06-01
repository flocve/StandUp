# 🛠️ Guide de Dépannage SQLite

## ❌ Erreur WASM: "failed to match magic number"

Cette erreur indique un problème de chargement du fichier WebAssembly de sql.js.

### 🔍 Diagnostic

1. **Ouvrir la console navigateur** (F12)
2. **Vérifier les messages** de chargement sql.js
3. **Examiner l'onglet Network** pour voir si `sql-wasm.wasm` se charge

### ✅ Solutions par ordre de priorité

#### 1. **Vérifier les fichiers WASM**
```bash
# Vérifier que le fichier existe
ls public/dist/sql-wasm.wasm

# Si absent, le copier
cp node_modules/sql.js/dist/sql-wasm.wasm public/dist/
```

#### 2. **Test des URLs dans le navigateur**
Essayez d'accéder directement à :
- `http://localhost:5173/dist/sql-wasm.wasm` (local)
- `https://sql.js.org/dist/sql-wasm.wasm` (CDN)

#### 3. **Mode Fallback**
L'application basculera automatiquement en mode "mock" si SQL.js échoue :
```
✅ Mode fallback activé (base temporaire)
```

#### 4. **Solutions avancées**

##### A. Réinstaller sql.js
```bash
npm uninstall sql.js
npm install sql.js
cp node_modules/sql.js/dist/sql-wasm.wasm public/dist/
```

##### B. Utiliser une version différente
```bash
npm install sql.js@1.8.0
```

##### C. Configuration Vite alternative
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    exclude: ['sql.js']
  }
})
```

### 🧪 Test de fonctionnement

1. **Ouvrir la console navigateur**
2. **Exécuter le test** :
```javascript
// Tester l'initialisation
const db = SQLiteDatabase.getInstance();
await db.initialize();

// Vérifier le statut
console.log('Base initialisée:', !!db.getDatabase());
```

### 🔄 Modes de fonctionnement

| Mode | Description | Performance | Persistence |
|------|-------------|-------------|-------------|
| **SQLite normal** | WASM complet | Excellent | Oui (Node.js) |
| **Fallback** | Mock en mémoire | Limité | Non |

### 🌐 Problèmes réseau

Si les CDN sont bloqués :
1. **Désactiver les bloqueurs de pub**
2. **Vérifier le proxy/firewall**
3. **Utiliser uniquement les fichiers locaux**

### 🏥 Diagnostic avancé

#### Vérifier la version Node.js
```bash
node --version
# Recommandé: v18+ ou v20+
```

#### Vérifier les permissions
```bash
# Windows
icacls public/dist/sql-wasm.wasm

# Linux/Mac  
ls -la public/dist/sql-wasm.wasm
```

#### Logs détaillés
```javascript
// Dans la console navigateur
localStorage.setItem('debug', 'true');
location.reload();
```

### 🆘 Solutions de dernier recours

#### 1. Mode développement sans SQLite
```typescript
// src/ui/pages/Home.tsx
const FORCE_FALLBACK = true; // Mode dégradé
```

#### 2. Retour localStorage temporaire
Si vraiment bloqué, on peut créer un mode localStorage de transition.

### 📞 Support

Si le problème persiste :
1. **Copier les logs** de la console
2. **Noter la version** de navigateur/OS
3. **Tester sur un autre navigateur**

## 🎯 Indicateurs de bon fonctionnement

Console affiche :
```
🔄 Initialisation sql.js...
✅ sql.js initialisé avec succès (local)
🌐 Mode navigateur : base de données en mémoire
✅ Base de données SQLite initialisée
```

Interface affiche :
```
🗄️ Base de données SQLite
```

## ✅ **NOUVELLE SOLUTION : Approche Hybride CDN + Local**

L'application utilise maintenant une approche robuste qui évite les problèmes d'import :

1. **🔄 Tentative d'import local** (via Vite/npm)
2. **🌐 Fallback vers CDN** si l'import local échoue  
3. **🛡️ Mode mock** si tout échoue

### 🧪 **Test Rapide**

```javascript
// Dans la console navigateur
await testSQLite()
```

### 📊 **Messages de Réussite**

Console doit afficher :
```
🔄 Initialisation sql.js...
🔄 Tentative d'import local...
✅ sql.js importé localement
🔄 Initialisation avec WASM...
✅ sql.js initialisé avec succès
🌐 Mode navigateur : base de données en mémoire
✅ Base de données SQLite initialisée
```

**OU** si CDN utilisé :
```
🔄 Initialisation sql.js...
🔄 Tentative d'import local...
⚠️ Import local échoué, tentative CDN...
✅ sql.js chargé depuis le CDN
🔄 Initialisation avec WASM...
✅ sql.js initialisé avec succès
```

**OU** si mode fallback :
```
✅ Mode fallback activé (base temporaire)
```

## 👥 **Problème : Aucun Participant Affiché**

Si la base de données semble remplie mais l'application n'affiche aucun participant :

### 🔍 **Diagnostic Étape par Étape**

#### 1. **Test de Base de Données**
```javascript
// Dans la console navigateur (F12)
await dbUtils.diagnosticComplete()
```

Attendu :
- Tables créées ✅
- Participants comptés ✅  
- Données détaillées affichées ✅

#### 2. **Test du Repository**
```javascript
await testRepository()
```

Attendu :
- Repository initialisé ✅
- Participants hebdomadaires chargés ✅
- Participants quotidiens chargés ✅

#### 3. **Forcer l'Initialisation**
```javascript
// Si aucun participant trouvé
await dbUtils.initializeIfEmpty()
await testRepository()
```

### 🚨 **Causes Communes**

#### **Cause 1 : Base Vide**
```javascript
// Solution
await dbUtils.resetToDefaults()
location.reload() // Recharger la page
```

#### **Cause 2 : Repository Non Initialisé**
```javascript
// Vérifier l'initialisation
const repo = new SQLiteParticipantRepository();
await repo.initialize();
const participants = await repo.getAllWeeklyParticipants();
console.log('Participants:', participants.length);
```

#### **Cause 3 : Hook useParticipantSelection Bloqué**
Regarder la console pour des erreurs comme :
- `TypeError: Cannot read property...`
- `ParticipantRepository is undefined`
- `Database not initialized`

### ✅ **Solution Rapide**

```javascript
// Script de réparation complète
console.log('🔧 Réparation en cours...');

// 1. Diagnostic
await dbUtils.diagnosticComplete();

// 2. Forcer l'initialisation si vide
await dbUtils.initializeIfEmpty();

// 3. Test du repository
await testRepository();

// 4. Si toujours vide, réinitialiser
const success = await testRepository();
if (!success) {
  console.log('🔄 Réinitialisation forcée...');
  await dbUtils.resetToDefaults();
  await testRepository();
}

console.log('✅ Réparation terminée - rechargez la page');
```

### 🔄 **Après Diagnostic**

Si tout semble OK dans la console mais l'interface est vide :

1. **Rechargez la page** (F5)
2. **Videz le cache** (Ctrl+Shift+R)
3. **Redémarrez le serveur** (npm run dev) 