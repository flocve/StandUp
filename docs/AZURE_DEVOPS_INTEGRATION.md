# Intégration Azure DevOps

Ce document explique comment configurer l'intégration avec Azure DevOps pour récupérer automatiquement les tâches des participants.

## Configuration

### 1. Personal Access Token (PAT)

Pour utiliser l'API Azure DevOps, vous devez créer un Personal Access Token :

1. Allez sur [https://dev.azure.com/bazimo-app](https://dev.azure.com/bazimo-app)
2. Cliquez sur votre profil utilisateur (en haut à droite)
3. Sélectionnez **"Personal access tokens"**
4. Cliquez sur **"New Token"**
5. Configurez le token :
   - **Name** : `Wheel App`
   - **Organization** : `bazimo-app`
   - **Expiration** : Choisissez selon vos préférences
   - **Scopes** : Sélectionnez **"Work Items"** avec permissions **"Read"**
6. Cliquez sur **"Create"**
7. **Copiez le token généré** (vous ne pourrez plus le voir après)

### 2. Configuration de l'application

Créez un fichier `.env.local` à la racine du projet :

```env
VITE_AZURE_DEVOPS_PAT=your_personal_access_token_here
```

Remplacez `your_personal_access_token_here` par le token que vous avez copié.

## Utilisation

### Queries par participant

Actuellement configuré pour Florian avec la query : `3837546e-b531-4cbe-b8bb-b45ff30c1158`

Pour ajouter d'autres participants :

1. Créez une query dans Azure DevOps pour le participant
2. Récupérez l'ID de la query depuis l'URL
3. Ajoutez la configuration dans `src/services/azureDevOpsService.ts`

### Format des données

L'API Azure DevOps retourne les work items qui sont automatiquement convertis en format `Task` :

- **Type** : `Bug` → `BUG`, autres → `US`
- **Status** : Mapping automatique des états Azure DevOps
- **Priority** : Conversion des priorités numériques
- **Tags** : Séparés par point-virgule
- **URL** : Lien direct vers le work item

## Mode Démo

Si aucun Personal Access Token n'est configuré, l'application utilise automatiquement des données mockées pour les tests.

## Sécurité

⚠️ **Important** : 
- Ne commitez jamais votre Personal Access Token
- Le fichier `.env.local` est ignoré par Git
- Utilisez des tokens avec des permissions minimales (Read-only pour Work Items)

## Dépannage

### Erreur d'authentification
- Vérifiez que le token est correct
- Vérifiez que le token n'a pas expiré
- Vérifiez les permissions du token

### Pas de données
- Vérifiez que la query existe et est accessible
- Vérifiez que l'ID de query est correct
- Consultez la console du navigateur pour les erreurs

### CORS
Si vous rencontrez des erreurs CORS, l'API Azure DevOps peut nécessiter une configuration côté serveur ou l'utilisation d'un proxy. 