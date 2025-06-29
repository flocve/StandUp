export type TaskType = 'BUG' | 'US';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  subType?: string; // Type original d'Azure DevOps (Task, Feature, Epic, etc.)
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignee: string;
  url?: string;
  description?: string;
  tags?: string[];
  parentId?: string; // ID du parent pour la hiérarchie
  children?: Task[]; // Sous-tâches (enfants)
  storyPoints?: number; // Story points pour l'estimation
  devBack?: string; // Nom du développeur backend
  devFront?: string; // Nom du développeur frontend
}

export interface ParticipantTasks {
  participantName: string;
  tasks: Task[];
}

export interface HierarchicalTask extends Task {
  children: Task[];
}

// Fonction utilitaire pour organiser les tâches en hiérarchie
export const organizeTasksHierarchy = (tasks: Task[]): HierarchicalTask[] => {
  const taskMap = new Map<string, HierarchicalTask>();
  const parentTasks: HierarchicalTask[] = [];

  // Créer une map de toutes les tâches avec children initialisé
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Organiser en hiérarchie
  tasks.forEach(task => {
    const taskWithChildren = taskMap.get(task.id)!;
    
    if (task.parentId && taskMap.has(task.parentId)) {
      // C'est un enfant, l'ajouter à son parent
      const parent = taskMap.get(task.parentId)!;
      parent.children.push(taskWithChildren);
    } else {
      // C'est un parent ou une tâche racine
      parentTasks.push(taskWithChildren);
    }
  });

  return parentTasks;
};

// Données de démonstration - à remplacer par une vraie intégration Azure DevOps
export const DEMO_TASKS: ParticipantTasks[] = [
  {
    participantName: 'Alice',
    tasks: [
      {
        id: 'US-001',
        title: 'Implémenter la fonctionnalité de notification push',
        type: 'US',
        subType: 'User Story',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Alice',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12345',
        description: 'Développer le système de notifications push pour les utilisateurs mobiles',
        tags: ['frontend', 'mobile', 'notifications'],
        storyPoints: 5,
        devBack: 'Charlie Brown',
        devFront: 'Alice Thompson'
      },
      {
        id: 'BUG-042',
        title: 'Correction du bug d\'affichage des photos sur mobile',
        type: 'BUG',
        status: 'REVIEW',
        priority: 'MEDIUM',
        assignee: 'Alice',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12346',
        description: 'Les photos ne s\'affichent pas correctement sur les écrans mobiles',
        tags: ['mobile', 'ui', 'css'],
        storyPoints: 3
      },
      {
        id: 'US-007',
        title: 'Création du système de thèmes personnalisés',
        type: 'US',
        subType: 'Task',
        status: 'TODO',
        priority: 'LOW',
        assignee: 'Alice',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12355',
        description: 'Permettre aux utilisateurs de personnaliser les couleurs et thèmes',
        tags: ['frontend', 'ui', 'customization', 'themes']
      }
    ]
  },
  {
    participantName: 'Bob',
    tasks: [
      {
        id: 'US-002',
        title: 'Optimisation des performances de la base de données',
        type: 'US',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Bob',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12347',
        description: 'Améliorer les performances des requêtes sur la table des participants',
        tags: ['backend', 'database', 'performance']
      }
    ]
  },
  {
    participantName: 'Charlie',
    tasks: [
      {
        id: 'BUG-043',
        title: 'Erreur 500 lors de l\'upload des images',
        type: 'BUG',
        status: 'TODO',
        priority: 'CRITICAL',
        assignee: 'Charlie',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12348',
        description: 'Erreur serveur lors du téléchargement des images de profil',
        tags: ['backend', 'upload', 'error']
      },
      {
        id: 'US-003',
        title: 'Mise en place du système d\'authentification SSO',
        type: 'US',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignee: 'Charlie',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12349',
        description: 'Intégrer l\'authentification Single Sign-On avec Azure AD',
        tags: ['authentication', 'security', 'azure']
      }
    ]
  },
  {
    participantName: 'David',
    tasks: [
      {
        id: 'US-004',
        title: 'Refactoring du composant de sélection',
        type: 'US',
        status: 'REVIEW',
        priority: 'LOW',
        assignee: 'David',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12350',
        description: 'Refactoriser le composant de sélection pour améliorer la maintenabilité',
        tags: ['frontend', 'refactoring', 'code-quality']
      }
    ]
  },
  {
    participantName: 'Lewis',
    tasks: [
      {
        id: 'US-005',
        title: 'Développement de l\'API de gestion des participants',
        type: 'US',
        subType: 'Feature',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12351',
        description: 'Créer les endpoints REST pour la gestion CRUD des participants',
        tags: ['backend', 'api', 'rest', 'crud'],
        storyPoints: 8,
        devBack: 'Lewis Martin',
        devFront: 'Alice Thompson'
      },
      {
        id: 'TASK-1001',
        title: 'Créer endpoint POST /participants',
        type: 'US',
        subType: 'Task',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/1001',
        description: 'Implémenter l\'endpoint pour créer de nouveaux participants',
        tags: ['backend', 'api', 'post'],
        parentId: 'US-005',
        storyPoints: 3
      },
      {
        id: 'TASK-1002',
        title: 'Ajouter validation des données',
        type: 'US',
        subType: 'Task',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/1002',
        description: 'Valider les données d\'entrée pour l\'API',
        tags: ['backend', 'validation'],
        parentId: 'US-005',
        storyPoints: 2
      },
      {
        id: 'BUG-044',
        title: 'Problème de synchronisation temps réel',
        type: 'BUG',
        status: 'TODO',
        priority: 'CRITICAL',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12352',
        description: 'Les mises à jour en temps réel ne se synchronisent pas correctement entre les clients',
        tags: ['realtime', 'websocket', 'synchronization'],
        storyPoints: 5,
        devBack: 'Lewis Martin',
        devFront: 'Simon Clark'
      },
      {
        id: 'TASK-1003',
        title: 'Débugger les événements WebSocket',
        type: 'BUG',
        subType: 'Task',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/1003',
        description: 'Identifier pourquoi les WebSocket ne se synchronisent pas',
        tags: ['debug', 'websocket'],
        parentId: 'BUG-044',
        storyPoints: 2
      }
     ]
  },
  {
    participantName: 'Emma',
    tasks: []
  },
  {
    participantName: 'Florian',
    tasks: [
      {
        id: 'US-201',
        title: 'Amélioration de l\'interface utilisateur du dashboard',
        type: 'US',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Florian',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/201',
        description: 'Refonte complète de l\'interface du dashboard',
        tags: ['ui', 'dashboard', 'frontend']
      },
      {
        id: 'BUG-202',
        title: 'Problème de performance sur la page des rapports',
        type: 'BUG',
        status: 'TODO',
        priority: 'CRITICAL',
        assignee: 'Florian',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/202',
        description: 'La page met trop de temps à se charger',
        tags: ['performance', 'rapports']
      },
      {
        id: 'US-203',
        title: 'Intégration Azure DevOps API',
        type: 'US',
        status: 'REVIEW',
        priority: 'MEDIUM',
        assignee: 'Florian',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/203',
        description: 'Connecter l\'app avec Azure DevOps',
        tags: ['api', 'integration', 'azure']
      }
    ]
  }
];

export const getTasksForParticipant = (participantName: string): Task[] => {
  const participantTasks = DEMO_TASKS.find(
    pt => pt.participantName.toLowerCase() === participantName.toLowerCase()
  );
  return participantTasks?.tasks || [];
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'TODO':
      return '#64748b'; // Gris
    case 'IN_PROGRESS':
      return '#3b82f6'; // Bleu
    case 'REVIEW':
      return '#f59e0b'; // Orange
    case 'DONE':
      return '#10b981'; // Vert
    default:
      return '#64748b';
  }
};

export const getTaskTypeColor = (type: TaskType): string => {
  switch (type) {
    case 'BUG':
      return '#ef4444'; // Rouge
    case 'US':
      return '#8b5cf6'; // Violet
    default:
      return '#64748b';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'CRITICAL':
      return '#dc2626'; // Rouge foncé
    case 'HIGH':
      return '#ea580c'; // Orange foncé
    case 'MEDIUM':
      return '#ca8a04'; // Jaune
    case 'LOW':
      return '#059669'; // Vert
    default:
      return '#64748b';
  }
}; 