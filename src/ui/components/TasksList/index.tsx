import React from 'react';
import styled, { keyframes } from 'styled-components';
import { type Task, type TaskType, type TaskStatus, getTaskStatusColor, getTaskTypeColor, getPriorityColor } from '../../../domain/task/entities';

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
  margin-left: auto;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const TasksList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 0.75rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
  gap: 0.5rem;
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
  tasks: Task[];
  participantName: string;
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

const TasksListComponent: React.FC<TasksListProps> = ({ tasks, participantName }) => {
  const handleTaskClick = (task: Task) => {
    if (task.url) {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <TasksContainer>
      <TasksHeader>
        <TasksIcon>📋</TasksIcon>
        <TasksTitle>Tâches en cours</TasksTitle>
        <TasksCount>{tasks.length}</TasksCount>
      </TasksHeader>

      {tasks.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🎉</EmptyIcon>
          <EmptyText>Aucune tâche en cours !</EmptyText>
        </EmptyState>
      ) : (
        <TasksList>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              priority={task.priority}
              onClick={() => handleTaskClick(task)}
            >
              <TaskHeader>
                <TaskInfo>
                  <TaskTitle>{task.title}</TaskTitle>
                  <TaskId>{task.id}</TaskId>
                </TaskInfo>
                <TaskBadges>
                  <TaskTypeComponent type={task.type}>{task.type}</TaskTypeComponent>
                  <TaskStatusComponent status={task.status}>
                    {formatStatus(task.status)}
                  </TaskStatusComponent>
                </TaskBadges>
              </TaskHeader>

              <TaskMeta>
                <TaskTags>
                  {task.tags?.slice(0, 3).map((tag) => (
                    <TaskTag key={tag}>{tag}</TaskTag>
                  ))}
                  {task.tags && task.tags.length > 3 && (
                    <TaskTag>+{task.tags.length - 3}</TaskTag>
                  )}
                </TaskTags>
                <TaskPriority priority={task.priority}>
                  <PriorityDot priority={task.priority} />
                  {formatPriority(task.priority)}
                </TaskPriority>
              </TaskMeta>
            </TaskItem>
          ))}
        </TasksList>
      )}
    </TasksContainer>
  );
};

export default TasksListComponent; 