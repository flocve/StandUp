import { type Task, type TaskType, type TaskStatus } from '../domain/task/entities';

// Configuration Azure DevOps
const AZURE_DEVOPS_CONFIG = {
  organization: 'bazimo-app',
  project: 'bazimo-app',
  // À configurer avec votre Personal Access Token
  personalAccessToken: import.meta.env.VITE_AZURE_DEVOPS_PAT || '',
  baseUrl: 'https://dev.azure.com'
};

// Types pour l'API Azure DevOps
interface AzureDevOpsWorkItem {
  id: number;
  fields: {
    'System.Title': string;
    'System.WorkItemType': string;
    'System.State': string;
    'System.ChangedDate': string;
    'System.AssignedTo'?: {
      displayName: string;
      uniqueName: string;
    };
    'Microsoft.VSTS.Common.Priority'?: number;
    'System.Tags'?: string;
    'System.Description'?: string;
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
    'Custom.DevBack'?: {
      displayName: string;
      uniqueName: string;
    };
    'Custom.DevFront'?: {
      displayName: string;
      uniqueName: string;
    };
    'WEF_D183F706FE5B456192451588A0D416E0_Kanban.Column'?: string;
    'WEF_A3BDA26DE94A4B178A86C8AFBD1BCF21_Kanban.Column'?: string;
  };
  url: string;
}

interface AzureDevOpsQueryResult {
  queryType: string;
  queryResultType: string;
  asOf: string;
  columns: Array<{
    referenceName: string;
    name: string;
    url: string;
  }>;
  workItems: Array<{
    id: number;
    url: string;
  }>;
}

// Mapping des statuts Azure DevOps vers nos types
const mapStatusToTaskStatus = (state: string): TaskStatus => {
  const lowerState = state.toLowerCase();
  
  if (lowerState.includes('new') || lowerState.includes('to do') || lowerState.includes('proposed')) {
    return 'TODO';
  }
  if (lowerState.includes('active') || lowerState.includes('in progress') || lowerState.includes('doing')) {
    return 'IN_PROGRESS';
  }
  if (lowerState.includes('in test') || lowerState.includes('review') || lowerState.includes('resolved') || lowerState === 'pr') {
    return 'REVIEW';
  }
  if (lowerState.includes('ready for prod') || lowerState.includes('done') || lowerState.includes('closed')) {
    return 'DONE';
  }
  return 'TODO';
};

// Mapping des types Azure DevOps vers nos types
const mapWorkItemTypeToTaskType = (workItemType: string): TaskType => {
  const lowerType = workItemType.toLowerCase();
  
  if (lowerType.includes('bug')) {
    return 'BUG';
  }
  if (lowerType.includes('technical')) {
    return 'TECHNICAL';
  }
  if (lowerType.includes('task')) {
    return 'TASK';
  }
  if (lowerType.includes('feature')) {
    return 'FEATURE';
  }
  if (lowerType.includes('epic')) {
    return 'EPIC';
  }
  if (lowerType.includes('user story') || lowerType.includes('story')) {
    return 'US';
  }
  
  // Pour les types non reconnus, on regarde le préfixe dans l'ID
  return 'US'; // Par défaut, considérer comme User Story
};

// Mapping de la priorité
const mapPriorityToTaskPriority = (priority?: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
  if (!priority) return 'MEDIUM';
  if (priority === 1) return 'CRITICAL';
  if (priority === 2) return 'HIGH';
  if (priority === 3) return 'MEDIUM';
  return 'LOW';
};

// Fonction pour créer les headers d'authentification
const getAuthHeaders = (): Record<string, string> => {
  const token = AZURE_DEVOPS_CONFIG.personalAccessToken;
  if (!token) {
    console.warn('Azure DevOps Personal Access Token non configuré');
    return {
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Authorization': `Basic ${btoa(`:${token}`)}`,
    'Content-Type': 'application/json',
  };
};

// Fonction pour récupérer les résultats d'une query
export const getWorkItemsFromQuery = async (queryId: string): Promise<Task[]> => {
  try {
    // Si pas de token, retourner les données mockées
    if (!AZURE_DEVOPS_CONFIG.personalAccessToken) {
      console.info('Mode démo - utilisation des données mockées');
      return getDemoTasksForCurrentUser();
    }

    const { organization, project } = AZURE_DEVOPS_CONFIG;
    
    // Étape 1: Récupérer les IDs des work items depuis la query
    const queryUrl = `${AZURE_DEVOPS_CONFIG.baseUrl}/${organization}/${project}/_apis/wit/wiql/${queryId}?api-version=7.1`;
    
    const queryResponse = await fetch(queryUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!queryResponse.ok) {
      throw new Error(`Erreur lors de la récupération de la query: ${queryResponse.status} ${queryResponse.statusText}`);
    }

    const queryResult: any = await queryResponse.json();
    
    // Gérer les différents types de réponses de query
    let workItemIds: number[] = [];
    
    if (queryResult.queryResultType === 'workItem' && queryResult.workItems) {
      // Query standard qui retourne directement des work items
      workItemIds = queryResult.workItems.map((wi: { id: number }) => wi.id);
    } else if (queryResult.queryResultType === 'workItemLink' && queryResult.workItemRelations) {
      // Query qui retourne des relations entre work items
      const uniqueIds = new Set<number>();
      
      queryResult.workItemRelations.forEach((relation: any) => {
        if (relation.source?.id) uniqueIds.add(relation.source.id);
        if (relation.target?.id) uniqueIds.add(relation.target.id);
      });
      
      workItemIds = Array.from(uniqueIds);
    }
    
    if (workItemIds.length === 0) {
      return [];
    }

    // Étape 2: Récupérer les détails des work items
    const workItemIdsString = workItemIds.join(',');
    const workItemsUrl = `${AZURE_DEVOPS_CONFIG.baseUrl}/${organization}/${project}/_apis/wit/workitems?ids=${workItemIdsString}&api-version=7.1`;
    
    const workItemsResponse = await fetch(workItemsUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!workItemsResponse.ok) {
      throw new Error(`Erreur lors de la récupération des work items: ${workItemsResponse.status} ${workItemsResponse.statusText}`);
    }

    const workItemsResult = await workItemsResponse.json();
    
    // Étape 3: Extraire les relations hiérarchiques
    const hierarchyRelations = new Map<number, number>(); // enfant -> parent
    if (queryResult.queryResultType === 'workItemLink' && queryResult.workItemRelations) {
      queryResult.workItemRelations.forEach((relation: any) => {
        if (relation.rel === 'System.LinkTypes.Hierarchy-Forward' && relation.source?.id && relation.target?.id) {
          hierarchyRelations.set(relation.target.id, relation.source.id);
        }
      });
    }
    
    // Étape 4: Créer une map des work items par ID pour résoudre les types parents
    const workItemsMap = new Map<number, AzureDevOpsWorkItem>();
    workItemsResult.value.forEach((workItem: AzureDevOpsWorkItem) => {
      workItemsMap.set(workItem.id, workItem);
    });
    
    // Étape 5: Transformer les données Azure DevOps en format Task
    const tasks: Task[] = workItemsResult.value.map((workItem: AzureDevOpsWorkItem) => {
      const tags = workItem.fields['System.Tags'] 
        ? workItem.fields['System.Tags'].split(';').map(tag => tag.trim())
        : [];

      const originalType = workItem.fields['System.WorkItemType'];
      const parentWorkItemId = hierarchyRelations.get(workItem.id);
      let parentId: string | undefined;
      
      if (parentWorkItemId && workItemsMap.has(parentWorkItemId)) {
        const parentWorkItem = workItemsMap.get(parentWorkItemId)!;
        const parentType = parentWorkItem.fields['System.WorkItemType'];
        parentId = `${parentType.toUpperCase()}-${parentWorkItemId}`;
      }
      
      // Extraire la colonne Kanban avec priorité aux colonnes spécifiques
      const kanbanColumn1 = workItem.fields['WEF_D183F706FE5B456192451588A0D416E0_Kanban.Column'];
      const kanbanColumn2 = workItem.fields['WEF_A3BDA26DE94A4B178A86C8AFBD1BCF21_Kanban.Column'];
      
      // Priorité : si une des colonnes est GO MEP ou Test, l'utiliser, sinon prendre la première
      let kanbanColumn: string | undefined;
      if (kanbanColumn2 === 'GO MEP' || kanbanColumn2 === 'A TESTER') {
        kanbanColumn = kanbanColumn2;
      } else if (kanbanColumn1) {
        kanbanColumn = kanbanColumn1;
      } else {
        kanbanColumn = kanbanColumn2;
      }

      const task: Task = {
        id: `${originalType.toUpperCase()}-${workItem.id}`,
        title: workItem.fields['System.Title'],
        type: mapWorkItemTypeToTaskType(originalType),
        subType: originalType, // Conserver le type original d'Azure DevOps
        status: mapStatusToTaskStatus(workItem.fields['System.State']),
        priority: mapPriorityToTaskPriority(workItem.fields['Microsoft.VSTS.Common.Priority']),
        assignee: workItem.fields['System.AssignedTo']?.displayName || 'Non assigné',
        url: `${AZURE_DEVOPS_CONFIG.baseUrl}/${organization}/${project}/_workitems/edit/${workItem.id}`,
        description: workItem.fields['System.Description'] || '',
        tags: tags.filter(tag => tag.length > 0),
        parentId: parentId,
        storyPoints: workItem.fields['Microsoft.VSTS.Scheduling.StoryPoints'],
        devBack: workItem.fields['Custom.DevBack']?.displayName,
        devFront: workItem.fields['Custom.DevFront']?.displayName,
        kanbanColumn: kanbanColumn,
        changedDate: workItem.fields['System.ChangedDate']
      };

      return task;
    });

    return tasks;

  } catch (error) {
    console.error('Erreur lors de la récupération des tâches Azure DevOps:', error);
    // En cas d'erreur, retourner les données mockées
    return getDemoTasksForCurrentUser();
  }
};

// Fonction pour normaliser les noms (supprimer les accents)
const normalizeString = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

// Fonction pour récupérer les tâches d'un participant spécifique
export const getTasksForParticipantFromAzure = async (participantName: string): Promise<Task[]> => {
  // Normaliser le nom pour la comparaison
  const normalizedName = normalizeString(participantName);
  
  // Pour Florian, utiliser sa query spécifique
  if (normalizedName === 'florian') {
    return await getWorkItemsFromQuery('c9e09490-3cd4-4432-b327-a54f67381bda');
  }
  if (normalizedName === 'simon') {
    return await getWorkItemsFromQuery('58aeb9cb-8779-4c2f-8ad8-decd0d286690');
  }
  if (normalizedName === 'kevin') {
    return await getWorkItemsFromQuery('3c8fb73a-ad5f-4bdc-9508-d08b610b2ef2');
  }
  if (normalizedName === 'lewis') {
    return await getWorkItemsFromQuery('9f3b3e37-269a-47bd-9400-a9b890c7a627');
  }
  if (normalizedName === 'gregory') {
    return await getWorkItemsFromQuery('abb22c69-a1ab-4f1f-bfd2-6d4f99409d0c');
  }
  if (normalizedName === 'luciano') {
    return await getWorkItemsFromQuery('5941b933-2c60-44a3-827a-ef57580693cb');
  }
  if (normalizedName === 'rachid') {
    return await getWorkItemsFromQuery('46238f91-2de3-416e-854f-e93b152dc1a8');
  }

  return [];
};

// Données de démonstration pour les tests
const getDemoTasksForCurrentUser = (): Task[] => {
  const now = new Date();
  const recentDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // Il y a 2 heures
  const oldDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // Il y a 3 jours

  return [
    {
      id: 'US-101',
      title: 'Amélioration de l\'interface utilisateur du dashboard',
      type: 'US',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignee: 'Florian',
      url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/101',
      description: 'Refonte complète de l\'interface du dashboard pour améliorer l\'expérience utilisateur',
      tags: ['ui', 'dashboard', 'frontend', 'design'],
      changedDate: recentDate.toISOString() // Tâche récente
    },
    {
      id: 'BUG-102',
      title: 'Problème de performance sur la page des rapports',
      type: 'BUG',
      status: 'TODO',
      priority: 'CRITICAL',
      assignee: 'Florian',
      url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/102',
      description: 'La page des rapports met trop de temps à se charger avec beaucoup de données',
      tags: ['performance', 'rapports', 'optimization'],
      changedDate: oldDate.toISOString() // Tâche ancienne
    },
    {
      id: 'US-103',
      title: 'Intégration avec l\'API externe de notifications',
      type: 'US',
      status: 'REVIEW',
      priority: 'MEDIUM',
      assignee: 'Florian',
      url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/103',
      description: 'Connecter l\'application avec le service de notifications externe',
      tags: ['api', 'notifications', 'integration'],
      changedDate: recentDate.toISOString() // Tâche récente
    }
  ];
};

// Configuration et validation
export const validateAzureDevOpsConfig = (): boolean => {
  const requiredConfig = [
    AZURE_DEVOPS_CONFIG.organization,
    AZURE_DEVOPS_CONFIG.project
  ];
  
  const isValid = requiredConfig.every(config => config && config.length > 0);
  
  if (!isValid) {
    console.error('Configuration Azure DevOps incomplète');
  }
  
  if (!AZURE_DEVOPS_CONFIG.personalAccessToken) {
    console.warn('Personal Access Token Azure DevOps non défini - utilisation du mode démo');
  }
  
  return isValid;
}; 