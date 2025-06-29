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
    'System.AssignedTo'?: {
      displayName: string;
      uniqueName: string;
    };
    'Microsoft.VSTS.Common.Priority'?: number;
    'System.Tags'?: string;
    'System.Description'?: string;
    'Microsoft.VSTS.Scheduling.StoryPoints'?: number;
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
  if (lowerState.includes('review') || lowerState.includes('resolved')) {
    return 'REVIEW';
  }
  if (lowerState.includes('done') || lowerState.includes('closed')) {
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
  return 'US'; // Par défaut, tout le reste est considéré comme User Story
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
        storyPoints: workItem.fields['Microsoft.VSTS.Scheduling.StoryPoints']
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

// Fonction pour récupérer les tâches d'un participant spécifique
export const getTasksForParticipantFromAzure = async (participantName: string): Promise<Task[]> => {
  // Pour Florian, utiliser sa query spécifique
  if (participantName.toLowerCase() === 'florian') {
    return await getWorkItemsFromQuery('3837546e-b531-4cbe-b8bb-b45ff30c1158');
  }
  
  // Pour les autres participants, vous pouvez :
  // 1. Créer des queries spécifiques pour chaque personne
  // 2. Utiliser une query générale et filtrer par assigné
  // 3. Utiliser les données mockées
  
  // Pour l'instant, utilisons les données mockées pour les autres
  const { getTasksForParticipant } = await import('../domain/task/entities');
  return getTasksForParticipant(participantName);
};

// Données de démonstration pour les tests
const getDemoTasksForCurrentUser = (): Task[] => {
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
      tags: ['ui', 'dashboard', 'frontend', 'design']
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
      tags: ['performance', 'rapports', 'optimization']
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
      tags: ['api', 'notifications', 'integration']
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