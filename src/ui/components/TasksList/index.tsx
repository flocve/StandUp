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
  background: linear-gradient(135deg, 
    rgba(var(--card-background-rgb, 51, 65, 85), 0.8) 0%, 
    rgba(var(--card-background-rgb, 30, 41, 59), 0.9) 100%);
  border: 2px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
  border-radius: 20px;
  padding: 1rem;
  margin: 0.5rem 0 0.75rem 0;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: ${fadeInScale} 0.6s ease-out;
  width: 100%;
  max-height: 320px;
  overflow-y: auto;

  /* Scrollbar personnalisée */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(var(--accent-primary-rgb, 59, 130, 246), 0.05) 0%, 
      transparent 50%, 
      rgba(var(--accent-primary-rgb, 59, 130, 246), 0.03) 100%);
    pointer-events: none;
    border-radius: 18px;
  }
`;

const TasksHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
`;

const TasksIcon = styled.div`
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
`;

const TasksTitle = styled.h4`
  color: var(--text-primary);
  font-size: 1.125rem;
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
  background: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
  color: var(--accent-primary);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 8px;
  border: 1px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  z-index: 1;

  @media (min-width: 1200px) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const TaskItem = styled.div<{ priority: string }>`
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid ${props => getPriorityColor(props.priority)};
  border-radius: 12px;
  padding: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.12) 0%, 
      rgba(255, 255, 255, 0.08) 100%);
    border-color: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.5);
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
  margin-bottom: 0.5rem;
  gap: 0.75rem;
`;

const TaskInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.div`
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.3;
  margin-bottom: 0.2rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  margin-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 0.5rem;
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
  margin-top: 0.5rem;
  gap: 0.5rem;
`;

const TaskTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  flex: 1;
`;

const TaskTag = styled.span`
  background: rgba(var(--accent-primary-rgb, 59, 130, 246), 0.2);
  color: var(--accent-primary);
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  border: 1px solid rgba(var(--accent-primary-rgb, 59, 130, 246), 0.3);
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
  useAzureDevOps = false 
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

  const renderHierarchicalTask = (hierarchicalTask: HierarchicalTask) => (
    <TaskItem
      key={hierarchicalTask.id}
      priority={hierarchicalTask.priority}
      onClick={() => handleTaskClick(hierarchicalTask)}
    >
      <TaskHeader>
        <TaskInfo>
          <TaskTitle>{hierarchicalTask.title}</TaskTitle>
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
          {hierarchicalTask.children.map((subTask) => (
            <SubTaskItem
              key={subTask.id}
              onClick={(e) => handleSubTaskClick(subTask, e)}
              title={`${subTask.id} - ${formatStatus(subTask.status)}`}
            >
              {subTask.title}
            </SubTaskItem>
          ))}
        </SubTasksList>
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
          {hierarchicalTasks.map(renderHierarchicalTask)}
        </TasksList>
      )}
    </TasksContainer>
  );
};

export default TasksListComponent; 