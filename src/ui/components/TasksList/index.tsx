import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  type Task, 
  type TaskType, 
  type TaskStatus, 
  type HierarchicalTask, 
  getTaskStatusColor, 
  getTaskTypeColor, 
  getPriorityColor,
  organizeTasksHierarchy
} from '../../../domain/task/entities';
import { getTasksForParticipantFromAzure } from '../../../services/azureDevOpsService';
import { getParticipantPhotoUrlWithTheme } from '../../../utils/animalPhotos';
import { Participant, DailyParticipant } from '../../../domain/participant/entities';

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
`;

const TasksContainer = styled.div`
  background: var(--card-background);
  border: 2px solid var(--border-primary);
  border-radius: 20px;
  padding: 0.75rem;
  margin: 0.25rem 0 0.5rem 0;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: ${fadeInScale} 0.6s ease-out;
  width: 100%;
  max-height: 600px;
  overflow-y: auto;

  /* Scrollbar personnalisée */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--surface-overlay);
    pointer-events: none;
    border-radius: 18px;
  }
`;

const TasksHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
`;

const TasksIcon = styled.div`
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const TasksTitle = styled.h4`
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const TasksCount = styled.span`
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const TasksMetrics = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
  align-items: center;
`;

const StoryPointsTotal = styled.span`
  background: var(--badge-background);
  color: var(--badge-text);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  border: 1px solid var(--badge-border);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const DevelopersSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-secondary);
`;

const DeveloperAvatar = styled.div<{ $type: 'front' | 'back' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.$type === 'front' 
    ? 'var(--dev-front-bg)' 
    : 'var(--dev-back-bg)'};
  border: 1px solid ${props => props.$type === 'front' 
    ? 'var(--dev-front-border)' 
    : 'var(--dev-back-border)'};
  color: ${props => props.$type === 'front' 
    ? 'var(--dev-front-text)' 
    : 'var(--dev-back-text)'};
  padding: 0.15rem 0.4rem;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 500;

  &::before {
    content: ${props => props.$type === 'front' ? "'🎨'" : "'⚙️'"};
    font-size: 0.7rem;
  }
`;

const DeveloperPhoto = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--border-photo);
`;

const DeveloperInitial = styled.div<{ $color: string; $bg: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: bold;
  border: 1px solid var(--border-photo);
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  z-index: 1;

  @media (min-width: 900px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    gap: 0.4rem;
  }
`;

const TaskItem = styled.div<{ priority: string }>`
  background: var(--surface-secondary);
  border: 1px solid var(--border-secondary);
  border-left: 3px solid ${props => getPriorityColor(props.priority)};
  border-radius: 10px;
  padding: 0.6rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: fit-content;

  &:hover {
    background: var(--surface-hover);
    border-color: var(--accent-primary);
    transform: translateY(-2px);
    animation: ${pulseGlow} 2s ease-in-out infinite;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.2) 50%, 
      transparent 100%);
  }
`;

const TaskHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.3rem;
  gap: 0.5rem;
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div`
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  max-height: calc(1.4em * 2);
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.02em;
  word-wrap: break-word;
  text-align: left;
`;

const TaskTitleHighlight = styled.span`
  color: var(--accent-secondary);
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  white-space: nowrap;
  background: var(--accent-secondary-bg);
  border-radius: 4px;
  border: 1px solid var(--accent-secondary-border);
`;

const TaskId = styled.div`
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
`;

const TaskBadges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const TaskTypeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
`;

const TaskTypeComponent = styled.span<{ type: TaskType }>`
  background: ${props => getTaskTypeColor(props.type)};
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const TaskSubType = styled.span`
  color: var(--text-secondary);
  font-size: 0.6rem;
  font-weight: 400;
  opacity: 0.7;
  text-transform: capitalize;
  font-style: italic;
`;

const SubTasksList = styled.div`
  margin-top: 0.5rem;
  border-top: 1px solid var(--border-secondary);
  padding-top: 0.35rem;
`;

const SubTaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  color: var(--text-secondary);
  font-size: 0.8rem;
  opacity: 0.8;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    opacity: 1;
    transform: translateX(2px);
  }

  &::before {
    content: '↳';
    color: var(--accent-primary);
    font-weight: bold;
    opacity: 0.6;
  }
`;

const SubTaskContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
`;

const SubTaskTitle = styled.span`
  flex: 1;
  text-align: left;
  line-height: 1.2;
  display: inline;
`;

const SubTaskStatus = styled.span<{ status: TaskStatus }>`
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  ${({ status }) => {
    switch (status) {
      case 'TODO':
        return `
          background: var(--status-todo-bg);
          color: var(--status-todo-text);
          border: 1px solid var(--status-todo-border);
        `;
      case 'IN_PROGRESS':
        return `
          background: var(--status-progress-bg);
          color: var(--status-progress-text);
          border: 1px solid var(--status-progress-border);
        `;
      case 'REVIEW':
        return `
          background: var(--status-review-bg);
          color: var(--status-review-text);
          border: 1px solid var(--status-review-border);
        `;
      case 'DONE':
        return `
          background: var(--status-done-bg);
          color: var(--status-done-text);
          border: 1px solid var(--status-done-border);
        `;
      default:
        return `
          background: var(--status-todo-bg);
          color: var(--status-todo-text);
          border: 1px solid var(--status-todo-border);
        `;
    }
  }}
`;

const TaskStatusComponent = styled.span<{ status: TaskStatus }>`
  background: ${props => getTaskStatusColor(props.status)};
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  text-transform: capitalize;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.35rem;
  gap: 0.4rem;
`;

const TaskTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  flex: 1;
`;

const TaskTag = styled.span`
  background: var(--tag-background);
  color: var(--tag-text);
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  border: 1px solid var(--tag-border);
`;

const TaskPriority = styled.div<{ priority: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => getPriorityColor(props.priority)};
  font-size: 0.7rem;
  font-weight: 600;
`;

const PriorityDot = styled.div<{ priority: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => getPriorityColor(props.priority)};
  box-shadow: 0 0 8px ${props => getPriorityColor(props.priority)}66;
`;

const StoryPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--accent-primary);
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.1);
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  border: 1px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
`;

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.6;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.8;
`;

interface TasksListProps {
  tasks?: Task[];
  participantName: string;
  useAzureDevOps?: boolean;
  allParticipants?: (Participant | DailyParticipant)[];
}

const formatStatus = (status: string): string => {
  switch (status) {
    case 'TODO':
      return 'À faire';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'REVIEW':
      return 'En revue';
    case 'DONE':
      return 'Terminé';
    default:
      return status;
  }
};

const formatPriority = (priority: string): string => {
  switch (priority) {
    case 'CRITICAL':
      return 'Critique';
    case 'HIGH':
      return 'Haute';
    case 'MEDIUM':
      return 'Moyenne';
    case 'LOW':
      return 'Basse';
    default:
      return priority;
  }
};

const TasksListComponent: React.FC<TasksListProps> = ({ 
  tasks: initialTasks, 
  participantName, 
  useAzureDevOps = false,
  allParticipants = []
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [hierarchicalTasks, setHierarchicalTasks] = useState<HierarchicalTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (useAzureDevOps) {
        setLoading(true);
        setError(null);
        try {
          const azureTasks = await getTasksForParticipantFromAzure(participantName);
          setTasks(azureTasks);
          setHierarchicalTasks(organizeTasksHierarchy(azureTasks));
        } catch (err) {
          console.error('Erreur lors du chargement des tâches:', err);
          setError('Erreur lors du chargement des tâches Azure DevOps');
          // Utiliser les tâches initiales en cas d'erreur
          const fallbackTasks = initialTasks || [];
          setTasks(fallbackTasks);
          setHierarchicalTasks(organizeTasksHierarchy(fallbackTasks));
        } finally {
          setLoading(false);
        }
      } else {
        const taskList = initialTasks || [];
        setTasks(taskList);
        setHierarchicalTasks(organizeTasksHierarchy(taskList));
      }
    };

    loadTasks();
  }, [participantName, useAzureDevOps, initialTasks]);

  const handleTaskClick = (task: Task) => {
    if (task.url) {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubTaskClick = (subTask: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (subTask.url) {
      window.open(subTask.url, '_blank', 'noopener,noreferrer');
    }
  };

  const calculateTotalStoryPoints = (task: HierarchicalTask): number => {
    const parentPoints = task.storyPoints || 0;
    const childrenPoints = task.children?.reduce((sum, child) => sum + (child.storyPoints || 0), 0) || 0;
    return parentPoints + childrenPoints;
  };

  const calculateGlobalStoryPoints = (): number => {
    return hierarchicalTasks.reduce((total, task) => total + calculateTotalStoryPoints(task), 0);
  };

  const getComplexityIcon = (storyPoints: number): string => {
    if (storyPoints === 0) return '😄'; // Super simple - tête très contente
    if (storyPoints <= 1) return '😄'; // Très facile
    if (storyPoints <= 2) return '😊'; // Facile
    if (storyPoints <= 3) return '🙂'; // Simple
    if (storyPoints <= 5) return '😐'; // Moyen
    if (storyPoints <= 8) return '😬'; // Difficile
    if (storyPoints <= 13) return '😰'; // Très difficile
    return '🤯'; // Super HARD (21+)
  };

  // Définir l'ordre de priorité des statuts (réutilisable)
  const statusPriority: Record<TaskStatus, number> = {
    'DONE': 0,      // Terminé - priorité la plus haute
    'REVIEW': 1,    // En revue 
    'IN_PROGRESS': 2, // En cours
    'TODO': 3       // À faire - priorité la plus basse
  };

  const sortSubTasksByStatus = (subTasks: Task[]): Task[] => {
    const sorted = [...subTasks].sort((a, b) => {
      const priorityA = statusPriority[a.status] ?? 999;
      const priorityB = statusPriority[b.status] ?? 999;
      return priorityA - priorityB;
    });
    return sorted;
  };

  const getTaskPriorities = (task: HierarchicalTask): { best: number; worst: number } => {
    // Récupérer le statut de la tâche principale
    let bestPriority = statusPriority[task.status] ?? 999;
    let worstPriority = statusPriority[task.status] ?? 999;
    
    // Vérifier les sous-tâches
    if (task.children && task.children.length > 0) {
      task.children.forEach(child => {
        const childPriority = statusPriority[child.status] ?? 999;
        if (childPriority < bestPriority) {
          bestPriority = childPriority;
        }
        if (childPriority > worstPriority) {
          worstPriority = childPriority;
        }
      });
    }
    
    return { best: bestPriority, worst: worstPriority };
  };

  const getHighestPriorityStatus = (task: HierarchicalTask): number => {
    return getTaskPriorities(task).best;
  };

  const sortHierarchicalTasksByStatus = (tasks: HierarchicalTask[]): HierarchicalTask[] => {
    return [...tasks].sort((a, b) => {
      const prioritiesA = getTaskPriorities(a);
      const prioritiesB = getTaskPriorities(b);
      
      // 1er critère : meilleure priorité (plus important)
      if (prioritiesA.best !== prioritiesB.best) {
        return prioritiesA.best - prioritiesB.best;
      }
      
      // 2ème critère : pire priorité (départage les égalités)
      if (prioritiesA.worst !== prioritiesB.worst) {
        return prioritiesA.worst - prioritiesB.worst;
      }
      
      // 3ème critère : ordre alphabétique (stabilité)
      return a.title.localeCompare(b.title);
    });
  };

  const parseTaskTitle = (title: string) => {
    const parts = title.split(/(\[.*?\])/);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <TaskTitleHighlight key={index}>
            {part}
          </TaskTitleHighlight>
        );
      }
      return part;
    });
  };

  const getDeveloperAvatar = (developerName: string): { photo: string; initial: string; colors: { bg: string; color: string } } => {
    // Extraire le prénom du displayName (premier mot)
    const firstName = developerName.split(' ')[0];
    
    // Chercher le participant correspondant par prénom
    const matchedParticipant = allParticipants.find(participant => {
      const participantName = participant.name.value;
      const participantFirstName = participantName.split(' ')[0];
      return participantFirstName.toLowerCase() === firstName.toLowerCase();
    });
    

    
    // Utiliser la vraie photo du participant s'il est trouvé, sinon générer un avatar
    const photo = matchedParticipant?.getPhotoUrl() || getParticipantPhotoUrlWithTheme(firstName);
    
    // Générer des couleurs pour l'initial basées sur le prénom
    const colors = {
      bg: `hsl(${firstName.charCodeAt(0) * 7 % 360}, 70%, 50%)`,
      color: 'white'
    };
    
    return {
      photo,
      initial: firstName.charAt(0).toUpperCase(),
      colors
    };
  };

  const renderHierarchicalTask = (hierarchicalTask: HierarchicalTask) => (
    <TaskItem
      key={hierarchicalTask.id}
      priority={hierarchicalTask.priority}
      onClick={() => handleTaskClick(hierarchicalTask)}
    >
      <TaskHeader>
        <TaskInfo>
          <TaskTitle>{parseTaskTitle(hierarchicalTask.title)}</TaskTitle>
          <TaskId>{hierarchicalTask.id}</TaskId>
        </TaskInfo>
        <TaskBadges>
          <TaskTypeContainer>
            <TaskTypeComponent type={hierarchicalTask.type}>{hierarchicalTask.type}</TaskTypeComponent>
            {hierarchicalTask.subType && hierarchicalTask.subType !== hierarchicalTask.type && (
              <TaskSubType>{hierarchicalTask.subType}</TaskSubType>
            )}
          </TaskTypeContainer>
          <TaskStatusComponent status={hierarchicalTask.status}>
            {formatStatus(hierarchicalTask.status)}
          </TaskStatusComponent>
        </TaskBadges>
      </TaskHeader>

      <TaskMeta>
        <TaskTags>
          {hierarchicalTask.tags?.slice(0, 3).map((tag) => (
            <TaskTag key={tag}>{tag}</TaskTag>
          ))}
          {hierarchicalTask.tags && hierarchicalTask.tags.length > 3 && (
            <TaskTag>+{hierarchicalTask.tags.length - 3}</TaskTag>
          )}
        </TaskTags>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {calculateTotalStoryPoints(hierarchicalTask) > 0 && (
            <StoryPoints>
              <span style={{ fontSize: '0.8rem' }}>
                {getComplexityIcon(calculateTotalStoryPoints(hierarchicalTask))}
              </span>
              {calculateTotalStoryPoints(hierarchicalTask)}
            </StoryPoints>
          )}
          <TaskPriority priority={hierarchicalTask.priority}>
            <PriorityDot priority={hierarchicalTask.priority} />
            {formatPriority(hierarchicalTask.priority)}
          </TaskPriority>
        </div>
      </TaskMeta>

      {/* Affichage des sous-tâches intégrées */}
      {hierarchicalTask.children && hierarchicalTask.children.length > 0 && (
        <SubTasksList>
          {sortSubTasksByStatus(hierarchicalTask.children).map((subTask) => (
            <SubTaskItem
              key={subTask.id}
              onClick={(e) => handleSubTaskClick(subTask, e)}
              title={`${subTask.id} - ${formatStatus(subTask.status)}`}
            >
              <SubTaskContent>
                <SubTaskTitle>{parseTaskTitle(subTask.title)}</SubTaskTitle>
                <SubTaskStatus status={subTask.status}>
                  {formatStatus(subTask.status)}
                </SubTaskStatus>
              </SubTaskContent>
            </SubTaskItem>
          ))}
        </SubTasksList>
      )}

      {/* Affichage des avatars des développeurs */}
      {(hierarchicalTask.devBack || hierarchicalTask.devFront) && (
        <DevelopersSection>
          {hierarchicalTask.devBack && (
            <DeveloperAvatar $type="back">
              <DeveloperPhoto 
                src={getDeveloperAvatar(hierarchicalTask.devBack).photo}
                alt={hierarchicalTask.devBack}
                onError={(e) => {
                  // Fallback vers l'initiale en cas d'erreur de chargement de l'image
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.removeAttribute('style');
                }}
              />
              <DeveloperInitial 
                $color={getDeveloperAvatar(hierarchicalTask.devBack).colors.color}
                $bg={getDeveloperAvatar(hierarchicalTask.devBack).colors.bg}
                style={{ display: 'none' }}
              >
                {getDeveloperAvatar(hierarchicalTask.devBack).initial}
              </DeveloperInitial>
              {hierarchicalTask.devBack.split(' ')[0]}
            </DeveloperAvatar>
          )}
          
          {hierarchicalTask.devFront && (
            <DeveloperAvatar $type="front">
              <DeveloperPhoto 
                src={getDeveloperAvatar(hierarchicalTask.devFront).photo}
                alt={hierarchicalTask.devFront}
                onError={(e) => {
                  // Fallback vers l'initiale en cas d'erreur de chargement de l'image
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.removeAttribute('style');
                }}
              />
              <DeveloperInitial 
                $color={getDeveloperAvatar(hierarchicalTask.devFront).colors.color}
                $bg={getDeveloperAvatar(hierarchicalTask.devFront).colors.bg}
                style={{ display: 'none' }}
              >
                {getDeveloperAvatar(hierarchicalTask.devFront).initial}
              </DeveloperInitial>
              {hierarchicalTask.devFront.split(' ')[0]}
            </DeveloperAvatar>
          )}
        </DevelopersSection>
      )}
    </TaskItem>
  );

  if (loading) {
    return (
      <TasksContainer>
        <TasksHeader>
          <TasksIcon>📋</TasksIcon>
          <TasksTitle>Tâches en cours</TasksTitle>
          <TasksCount>...</TasksCount>
        </TasksHeader>
        <EmptyState>
          <EmptyIcon>⏳</EmptyIcon>
          <EmptyText>Chargement des tâches...</EmptyText>
        </EmptyState>
      </TasksContainer>
    );
  }

  if (error) {
    return (
      <TasksContainer>
        <TasksHeader>
          <TasksIcon>📋</TasksIcon>
          <TasksTitle>Tâches en cours</TasksTitle>
          <TasksCount>!</TasksCount>
        </TasksHeader>
        <EmptyState>
          <EmptyIcon>⚠️</EmptyIcon>
          <EmptyText>{error}</EmptyText>
        </EmptyState>
      </TasksContainer>
    );
  }

  return (
    <TasksContainer>
      <TasksHeader>
        <TasksIcon>📋</TasksIcon>
        <TasksTitle>Tâches en cours</TasksTitle>
        <TasksMetrics>
          {calculateGlobalStoryPoints() > 0 && (
            <StoryPointsTotal>
              <span style={{ fontSize: '0.8rem' }}>
                {getComplexityIcon(calculateGlobalStoryPoints())}
              </span>
              {calculateGlobalStoryPoints()}
            </StoryPointsTotal>
          )}
          <TasksCount>{hierarchicalTasks.length}</TasksCount>
        </TasksMetrics>
      </TasksHeader>

      {hierarchicalTasks.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🎉</EmptyIcon>
          <EmptyText>Aucune tâche en cours !</EmptyText>
        </EmptyState>
      ) : (
        <TasksList>
          {sortHierarchicalTasksByStatus(hierarchicalTasks).map(renderHierarchicalTask)}
        </TasksList>
      )}
    </TasksContainer>
  );
};

export default TasksListComponent; 