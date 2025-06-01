# 👥 Gestion des Participants

## 🚀 **Méthode Rapide : Console du Navigateur**

### Ajouter un Participant
```javascript
// Dans la console du navigateur (F12)
await dbUtils.addParticipant("Nouveau Participant")
```

### Supprimer un Participant
```javascript
await dbUtils.removeParticipant("Nom à Supprimer")
```

### Lister tous les Participants
```javascript
await dbUtils.listParticipants()
```

### Voir les Statistiques
```javascript
await dbUtils.showStats()
```

## 📝 **Méthode Permanente : Données Initiales**

### 1. Ouvrir le fichier
```
src/infrastructure/persistence/sqlite/migrationHelper.ts
```

### 2. Ajouter vos participants
```typescript
export const INITIAL_PARTICIPANTS = [
  // ... participants existants ...
  
  // ✅ AJOUTEZ ICI :
  new Participant(
    new ParticipantId('9'),
    new ParticipantName('John Doe'),
    1
  ),
  new Participant(
    new ParticipantId('10'),
    new ParticipantName('Jane Smith'),
    1
  ),
];
```

### 3. Réinitialiser la base
```javascript
// Dans la console
await dbUtils.resetToDefaults()
```

## 🔧 **Méthode SQL Directe**

Pour les utilisateurs avancés :

```javascript
// Obtenir la base de données
const db = SQLiteDatabase.getInstance();
await db.initialize();
const database = db.getDatabase();

// Ajouter un participant
const id = Date.now().toString();
const name = "Nouveau Participant";

database.run(`
  INSERT INTO weekly_participants (id, name, chance_percentage, passage_count) 
  VALUES (?, ?, 1, 0)
`, [id, name]);

database.run(`
  INSERT INTO daily_participants (id, name, last_participation, has_spoken, speaking_order) 
  VALUES (?, ?, NULL, 0, NULL)
`, [id, name]);

// Sauvegarder
await db.save();
```

## 📊 **Exemples Pratiques**

### Ajouter Plusieurs Participants
```javascript
const nouveauxParticipants = [
  "Marie Dubois",
  "Pierre Martin", 
  "Sophie Leroy",
  "Thomas Petit"
];

for (const nom of nouveauxParticipants) {
  await dbUtils.addParticipant(nom);
}

// Vérifier
await dbUtils.listParticipants();
```

### Nettoyage et Recommencer
```javascript
// Supprimer tous les participants
await dbUtils.clearAllData();

// Remettre les participants par défaut
await dbUtils.resetToDefaults();

// Ajouter vos nouveaux participants
await dbUtils.addParticipant("Votre Nom");
```

## 🎯 **Conseils**

### ✅ **Bonnes Pratiques**
- Utilisez des noms complets (prénom + nom)
- Évitez les caractères spéciaux
- Gardez des noms courts et lisibles

### ⚠️ **Attention**
- `clearAllData()` supprime TOUT (irréversible)
- `resetToDefaults()` remet les participants par défaut
- La base en mode navigateur ne persiste pas (données perdues à la fermeture)

### 🔄 **Rechargement**
Après modification via console, rechargez la page pour voir les changements dans l'interface.

## 🧪 **Test Final**

```javascript
// Vérifier que tout fonctionne
await testSQLite();
await dbUtils.showStats();
await dbUtils.listParticipants();
``` 