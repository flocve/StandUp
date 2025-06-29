export type TaskType = 'BUG' | 'US';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignee: string;
  url?: string;
  description?: string;
  tags?: string[];
}

export interface ParticipantTasks {
  participantName: string;
  tasks: Task[];
}

// Données de démonstration - à remplacer par une vraie intégration Azure DevOps
export const DEMO_TASKS: ParticipantTasks[] = [
  {
    participantName: 'Alice',
    tasks: [
      {
        id: 'US-001',
        title: 'Implémenter la fonctionnalité de notification push',
        type: 'US',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Alice',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12345',
        description: 'Développer le système de notifications push pour les utilisateurs mobiles',
        tags: ['frontend', 'mobile', 'notifications']
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
        tags: ['mobile', 'ui', 'css']
      },
      {
        id: 'US-007',
        title: 'Création du système de thèmes personnalisés',
        type: 'US',
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
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12351',
        description: 'Créer les endpoints REST pour la gestion CRUD des participants',
        tags: ['backend', 'api', 'rest', 'crud']
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
        tags: ['realtime', 'websocket', 'synchronization']
      },
      {
        id: 'US-006',
        title: 'Optimisation des requêtes de base de données',
        type: 'US',
        status: 'REVIEW',
        priority: 'MEDIUM',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12353',
        description: 'Améliorer les performances des requêtes sur les grandes tables',
        tags: ['database', 'performance', 'optimization', 'sql']
      },
      {
        id: 'BUG-045',
        title: 'Erreur de validation des données utilisateur',
        type: 'BUG',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: 'Lewis',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12354',
        description: 'Les validations côté serveur ne fonctionnent pas pour certains champs',
        tags: ['validation', 'security', 'backend']
             }
     ]
  },
  {
    participantName: 'Simon',
    tasks: [
      {
        id: 'US-008',
        title: 'Intégration des tests unitaires automatisés',
        type: 'US',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignee: 'Simon',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12356',
        description: 'Mettre en place une suite de tests unitaires pour améliorer la qualité du code',
        tags: ['testing', 'quality', 'automation', 'jest']
      },
      {
        id: 'BUG-046',
        title: 'Memory leak détecté dans le composant wheel',
        type: 'BUG',
        status: 'TODO',
        priority: 'HIGH',
        assignee: 'Simon',
        url: 'https://dev.azure.com/bazimo-app/bazimo-app/_workitems/edit/12357',
        description: 'Fuite mémoire dans l\'animation de la roue qui ralentit l\'application',
        tags: ['performance', 'memory', 'animation', 'optimization']
             }
     ]
  },
  {
    participantName: 'Emma',
    tasks: []
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