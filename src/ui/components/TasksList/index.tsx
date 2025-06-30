import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  type Task, 
  type TaskType, 
  type TaskStatus, 
  type HierarchicalTask, 
  getTaskStatusColor, 
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
  from { 
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.4);
    transform: translateY(-2px) scale(1);
  }
  to { 
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5), 0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px) scale(1.01);
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const taskAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const TasksContainer = styled.div`
  background: var(--card-background);
  border: 2px solid var(--border-primary);
  border-radius: 2px;
  margin: 0.25rem 0 0.5rem 0;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  animation: ${fadeInScale} 0.6s ease-out;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  transition: opacity 0.2s ease-in-out;

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
  animation: ${slideInUp} 0.5s ease-out;
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

const TasksList = styled.div<{ $visible?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  transition: opacity 0.15s ease-in-out;
  opacity: ${props => props.$visible ? 1 : 0};
  flex: 1;

  @media (min-width: 900px) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 0 10px;
  }

  @media (max-width: 768px) {
    gap: 0.4rem;
  }
`;

const StatusColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
`;

const StatusColumnHeader = styled.div<{ $status: string }>`
  background: ${props => {
    switch (props.$status.toLowerCase()) {
      case 'go mep':
        return 'linear-gradient(135deg, #10b981, #059669)';
      case 'test':
        return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'en cours':
        return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      case 'todo':
        return 'linear-gradient(135deg, #6b7280, #4b5563)';
      default:
        return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    }
  }};
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 2px;
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 50;
`;

const StatusColumnTasks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const EmptyColumnMessage = styled.div`
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
  padding: 1rem;
  opacity: 0.7;
  font-size: 0.85rem;
`;

const TaskItem = styled.div<{ priority: string; $animationDelay?: number; $isRecentlyChanged?: boolean; $columnStatus?: string }>`
  background: var(--surface-secondary);
  border: 1px solid var(--border-secondary);
  border-left: 3px solid ${props => getPriorityColor(props.priority)};
  border-radius: 10px;
  padding: 0.6rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  min-height: fit-content;
  animation: ${taskAppear} 0.6s ease-out both;
  animation-delay: ${props => props.$animationDelay || 0}ms;

  /* Style pour les tâches récemment modifiées avec couleurs par colonne adaptées aux thèmes */
  ${props => props.$isRecentlyChanged && (() => {
    const getColumnColors = (status: string) => {
      switch (status) {
        case 'GO MEP':
          return {
            // Vert - Success
            bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)',
            border: '#22c55e',
            boxShadow: '0 0 0 1px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(34, 197, 94, 0.18)',
            hoverBg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(34, 197, 94, 0.10) 100%)',
            emoji: '✅'
          };
        case 'Test':
          return {
            // Orange - Warning/Test
            bg: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(251, 146, 60, 0.06) 100%)',
            border: '#fb923c',
            boxShadow: '0 0 0 1px rgba(251, 146, 60, 0.25), 0 4px 12px rgba(251, 146, 60, 0.18)',
            hoverBg: 'linear-gradient(135deg, rgba(251, 146, 60, 0.18) 0%, rgba(251, 146, 60, 0.10) 100%)',
            emoji: '🧪'
          };
        case 'En Cours':
          return {
            // Utilise la couleur d'accent principale du thème
            bg: 'linear-gradient(135deg, var(--accent-primary-alpha) 0%, var(--accent-primary-alpha) 100%)',
            border: 'var(--accent-primary)',
            boxShadow: '0 0 0 1px var(--accent-primary-alpha), 0 4px 12px var(--accent-primary-alpha)',
            hoverBg: 'linear-gradient(135deg, var(--accent-primary-alpha) 0%, var(--accent-primary-alpha) 100%)',
            emoji: '⚡'
          };
        case 'TODO':
          return {
            // Violet - Todo
            bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
            border: '#8b5cf6',
            boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.25), 0 4px 12px rgba(139, 92, 246, 0.18)',
            hoverBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(139, 92, 246, 0.10) 100%)',
            emoji: '📋'
          };
        default:
          return {
            // Fallback utilisant l'accent du thème
            bg: 'linear-gradient(135deg, var(--accent-primary-alpha) 0%, var(--accent-primary-alpha) 100%)',
            border: 'var(--accent-primary)',
            boxShadow: '0 0 0 1px var(--accent-primary-alpha), 0 4px 12px var(--accent-primary-alpha)',
            hoverBg: 'linear-gradient(135deg, var(--accent-primary-alpha) 0%, var(--accent-primary-alpha) 100%)',
            emoji: '🆕'
          };
      }
    };
    
    const colors = getColumnColors(props.$columnStatus || '');
    
    return `
      background: ${colors.bg};
      border: 2px solid ${colors.border};
      box-shadow: ${colors.boxShadow};
      
      &::before {
        content: '${colors.emoji}';
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        font-size: 1rem;
        z-index: 10;
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
      }
    `;
  })()}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    ${props => !props.$isRecentlyChanged && `
      background: var(--surface-hover);
      border-color: var(--accent-primary);
    `}
    
    ${props => props.$isRecentlyChanged && (() => {
      const getColumnColors = (status: string) => {
        switch (status) {
          case 'GO MEP':
            return { 
              hoverBg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.20) 0%, rgba(34, 197, 94, 0.12) 100%)', 
              border: '#22c55e' 
            };
          case 'Test':
            return { 
              hoverBg: 'linear-gradient(135deg, rgba(251, 146, 60, 0.20) 0%, rgba(251, 146, 60, 0.12) 100%)', 
              border: '#fb923c' 
            };
          case 'En Cours':
            return { 
              hoverBg: 'linear-gradient(135deg, var(--accent-primary-alpha) 0%, var(--accent-primary-alpha) 100%)', 
              border: 'var(--accent-primary)' 
            };
          case 'TODO':
            return { 
              hoverBg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.20) 0%, rgba(139, 92, 246, 0.12) 100%)', 
              border: '#8b5cf6' 
            };
          default:
            return { 
              hoverBg: 'linear-gradient(135deg, var(--accent-primary-alpha) 0%, var(--accent-primary-alpha) 100%)', 
              border: 'var(--accent-primary)' 
            };
        }
      };
      
      const colors = getColumnColors(props.$columnStatus || '');
      
      return `
        background: ${colors.hoverBg};
        border-color: ${colors.border};
      `;
    })()}
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
  background: ${props => {
    switch (props.type) {
      case 'BUG':
        return 'linear-gradient(135deg, #ff416c 0%, #ff4757 100%)';
      case 'US':
        return 'linear-gradient(135deg, #a55eea 0%, #8b5cf6 100%)';
      case 'TECHNICAL':
        return 'linear-gradient(135deg, #26d0ce 0%, #1dd1a1 100%)';
      case 'TASK':
        return 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)';
      case 'FEATURE':
        return 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)';
      case 'EPIC':
        return 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)';
      default:
        return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
    }
  }};
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &:hover::before {
    left: 100%;
  }

  &::after {
    content: ${props => {
      switch (props.type) {
        case 'BUG':
          return "'🐛'";
        case 'US':
          return "'👤'";
        case 'TECHNICAL':
          return "'⚙️'";
        case 'TASK':
          return "'📌'";
        case 'FEATURE':
          return "'✨'";
        case 'EPIC':
          return "'🎯'";
        default:
          return "'📋'";
      }
    }};
    font-size: 0.7rem;
    opacity: 0.9;
  }
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
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  padding-top: 0.35rem;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.35rem;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, 
      var(--accent-primary) 0%, 
      var(--accent-secondary) 50%, 
      var(--accent-primary) 100%);
    border-radius: 1px;
    opacity: 0.3;
  }

  &::after {
    content: '';
    position: absolute;
    left: -1px;
    top: 0.35rem;
    width: 4px;
    height: 4px;
    background: var(--accent-primary);
    border-radius: 50%;
    opacity: 0.4;
  }
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
  background: ${props => {
    switch (props.status) {
      case 'TODO':
        return '#f3f4f6';
      case 'IN_PROGRESS':
        return '#dbeafe';
      case 'REVIEW':
        return '#fef3c7';
      case 'DONE':
        return '#d1fae5';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'TODO':
        return '#6b7280';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'REVIEW':
        return '#d97706';
      case 'DONE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'TODO':
        return '#e5e7eb';
      case 'IN_PROGRESS':
        return '#93c5fd';
      case 'REVIEW':
        return '#fbbf24';
      case 'DONE':
        return '#34d399';
      default:
        return '#e5e7eb';
    }
  }};
  font-size: 0.65rem;
  font-weight: 500;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }
`;

const TaskStatusComponent = styled.span<{ status: TaskStatus }>`
  background: ${props => {
    switch (props.status) {
      case 'TODO':
        return '#f3f4f6';
      case 'IN_PROGRESS':
        return '#dbeafe';
      case 'REVIEW':
        return '#fef3c7';
      case 'DONE':
        return '#d1fae5';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'TODO':
        return '#6b7280';
      case 'IN_PROGRESS':
        return '#3b82f6';
      case 'REVIEW':
        return '#d97706';
      case 'DONE':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'TODO':
        return '#e5e7eb';
      case 'IN_PROGRESS':
        return '#93c5fd';
      case 'REVIEW':
        return '#fbbf24';
      case 'DONE':
        return '#34d399';
      default:
        return '#e5e7eb';
    }
  }};
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  letter-spacing: 0.025em;

  &:hover {
    opacity: 0.8;
  }
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

const TaskTag = styled.span<{ $index?: number }>`
  background: ${props => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return colors[(props.$index || 0) % colors.length];
  }};
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  border: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &::after {
    content: '🏷️';
    font-size: 0.5rem;
    opacity: 0.8;
  }
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
  animation: ${slideInUp} 0.5s ease-out;
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

const formatStatus = (status: string, kanbanColumn?: string): string => {
  // Si on a une colonne Kanban spécifique, l'utiliser en priorité
  if (kanbanColumn) {
    switch (kanbanColumn) {
      case 'Test OK':
        return 'Test OK';
      case 'Test KO':
        return 'Test KO';
      case 'Test en cours':
        return 'Test en cours';
      case 'A TESTER':
        return 'À tester';
      case 'GO MEP':
        return 'GO MEP';
      case 'Dev':
        return 'En développement';
      // Si la colonne Kanban n'est pas spécifique, fallback sur le statut
    }
  }
  
  // Fallback sur le mapping des statuts standards
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

// Cache pour les tâches Azure DevOps
const tasksCache = new Map<string, Task[]>();

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
  const [showTasks, setShowTasks] = useState(false);

  // Fonction pour vérifier si une tâche a été modifiée dans les dernières 24h
  const isRecentlyChanged = (task: HierarchicalTask): boolean => {
    if (!task.changedDate) return false;
    
    const changedDate = new Date(task.changedDate);
    const now = new Date();
    const diffInHours = (now.getTime() - changedDate.getTime()) / (1000 * 60 * 60);
    
    return diffInHours <= 24;
  };

  useEffect(() => {
    const loadTasks = async () => {
      setShowTasks(false); // Reset de l'animation
      
      if (useAzureDevOps) {
        // Vérifier le cache d'abord
        const cacheKey = participantName.toLowerCase();
        const cachedTasks = tasksCache.get(cacheKey);
        
        if (cachedTasks) {
          // Utiliser les tâches en cache sans loading
          setTasks(cachedTasks);
          setHierarchicalTasks(organizeTasksHierarchy(cachedTasks));
          setError(null);
          setShowTasks(true);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const azureTasks = await getTasksForParticipantFromAzure(participantName);
          // Mettre en cache les tâches
          tasksCache.set(cacheKey, azureTasks);
          setTasks(azureTasks);
          setHierarchicalTasks(organizeTasksHierarchy(azureTasks));
          
          // Déclencher l'animation d'apparition après un court délai
          setTimeout(() => {
            setShowTasks(true);
          }, 100);
        } catch (err) {
          console.error('Erreur lors du chargement des tâches:', err);
          setError('Erreur lors du chargement des tâches Azure DevOps');
          // Utiliser les tâches initiales en cas d'erreur
          const fallbackTasks = initialTasks || [];
          setTasks(fallbackTasks);
          setHierarchicalTasks(organizeTasksHierarchy(fallbackTasks));
          
          // Animation même en cas d'erreur
          setTimeout(() => {
            setShowTasks(true);
          }, 100);
        } finally {
          setLoading(false);
        }
      } else {
        const taskList = initialTasks || [];
        setTasks(taskList);
        setHierarchicalTasks(organizeTasksHierarchy(taskList));
        
        // Animation pour les tâches locales aussi
        setTimeout(() => {
          setShowTasks(true);
        }, 50);
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

  // Fonction pour normaliser les noms (supprimer les accents)
  const normalizeString = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  };

  const getDeveloperAvatar = (developerName: string): { photo: string; initial: string; colors: { bg: string; color: string } } => {
    // Extraire le prénom du displayName (premier mot)
    const firstName = developerName.split(' ')[0];
    
    // Chercher le participant correspondant par prénom
    const matchedParticipant = allParticipants.find(participant => {
      const participantName = participant.name.value;
      const participantFirstName = participantName.split(' ')[0];
      return normalizeString(participantFirstName) === normalizeString(firstName);
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

    // Fonction pour grouper les tâches par statut basé sur les colonnes Kanban Azure DevOps
  const groupTasksByStatus = (tasks: HierarchicalTask[]) => {
    const statusGroups = {
      'GO MEP': [] as HierarchicalTask[],
      'Test': [] as HierarchicalTask[],
      'En Cours': [] as HierarchicalTask[],
      'TODO': [] as HierarchicalTask[]
    };

    // Fonction pour déterminer le statut d'une sous-tâche
    const getSubTaskStatus = (subTask: Task): 'GO MEP' | 'Test' | 'En Cours' | 'TODO' => {
      const kanbanColumn = subTask.kanbanColumn;
      const status = subTask.status;
      
      if (kanbanColumn) {
        switch (kanbanColumn) {
          case 'GO MEP': 
            return 'GO MEP';
          case 'Test':
          case 'Test OK':
          case 'Test KO': 
          case 'Test en cours':
          case 'A TESTER': 
            return 'Test';
          case 'Dev': 
            return 'En Cours';
          default: 
            return 'TODO';
        }
      } else {
        // Fallback sur les statuts System.State
        switch (status) {
          case 'DONE':
            return 'GO MEP';
          case 'REVIEW':
            return 'Test';
          case 'IN_PROGRESS':
            return 'En Cours';
          case 'TODO':
          default:
            return 'TODO';
        }
      }
    };

    tasks.forEach(task => {
      // Déterminer le statut de base de la tâche
      const kanbanColumn = task.kanbanColumn;
      const status = task.status;
      let finalStatus: 'GO MEP' | 'Test' | 'En Cours' | 'TODO';
      
      // Mapper les colonnes Kanban et statuts vers nos colonnes
      if (kanbanColumn) {
        switch (kanbanColumn) {
          case 'GO MEP':
            finalStatus = 'GO MEP';
            break;
          case 'Test':
          case 'Test OK':
          case 'Test KO': 
          case 'Test en cours':
          case 'A TESTER':
            finalStatus = 'Test';
            break;
          case 'Dev':
            finalStatus = 'En Cours';
            break;
          default:
            finalStatus = 'TODO';
            break;
        }
      } else {
        // Fallback sur System.State si pas de colonne Kanban
        switch (status) {
          case 'DONE':
            // Pour les tâches DONE, vérifier s'il y a un indicateur de GO MEP
            finalStatus = 'GO MEP';
            break;
          case 'REVIEW':
            finalStatus = 'Test';
            break;
          case 'IN_PROGRESS':
            finalStatus = 'En Cours';
            break;
          case 'TODO':
          default:
            finalStatus = 'TODO';
            break;
        }
      }

      // Appliquer les règles de priorité basées sur les sous-tâches
      // Ces règles ne s'appliquent pas si la tâche est déjà en Test ou GO MEP
      if (finalStatus !== 'Test' && finalStatus !== 'GO MEP' && task.children && task.children.length > 0) {
        const subTaskStatuses = task.children.map(getSubTaskStatus);
        
        // Règle 1: S'il y a au moins une sous-tâche "En cours" → tâche va en "En cours"
        if (subTaskStatuses.includes('En Cours')) {
          finalStatus = 'En Cours';
        }
        // Règle 2: Sinon, s'il y a au moins une sous-tâche "TODO" → tâche va en "TODO"
        else if (subTaskStatuses.includes('TODO')) {
          finalStatus = 'TODO';
        }
      }

      // Ajouter la tâche dans la bonne colonne
      statusGroups[finalStatus].push(task);
    });

    // Trier chaque colonne pour mettre les tâches récentes en haut
    Object.keys(statusGroups).forEach(status => {
      const column = statusGroups[status as keyof typeof statusGroups];
      column.sort((a, b) => {
        const aIsRecent = isRecentlyChanged(a);
        const bIsRecent = isRecentlyChanged(b);
        
        // Les tâches récentes en premier
        if (aIsRecent && !bIsRecent) return -1;
        if (!aIsRecent && bIsRecent) return 1;
        
        // Pour les tâches de même "récence", trier par priorité puis par titre
        const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        return a.title.localeCompare(b.title);
      });
    });

    return statusGroups;
  };

  const renderHierarchicalTask = (hierarchicalTask: HierarchicalTask, index: number, isInGoMepColumn: boolean = false, columnStatus?: string) => (
    <TaskItem
      key={hierarchicalTask.id}
      priority={hierarchicalTask.priority}
      $animationDelay={showTasks ? index * 80 : 0}
      $isRecentlyChanged={isRecentlyChanged(hierarchicalTask)}
      $columnStatus={columnStatus}
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
          </TaskTypeContainer>
          <TaskStatusComponent status={hierarchicalTask.status}>
            {formatStatus(hierarchicalTask.status, hierarchicalTask.kanbanColumn)}
          </TaskStatusComponent>
        </TaskBadges>
      </TaskHeader>

      <TaskMeta>
        <TaskTags>
                     {hierarchicalTask.tags?.slice(0, 3).map((tag, index) => (
             <TaskTag key={tag} $index={index}>{tag}</TaskTag>
           ))}
           {hierarchicalTask.tags && hierarchicalTask.tags.length > 3 && (
             <TaskTag $index={3}>+{hierarchicalTask.tags.length - 3}</TaskTag>
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

      {/* Affichage des sous-tâches intégrées - masquées pour les tâches en GO MEP */}
      {!isInGoMepColumn && hierarchicalTask.children && hierarchicalTask.children.length > 0 && (
        <SubTasksList>
          {sortSubTasksByStatus(hierarchicalTask.children).map((subTask) => (
            <SubTaskItem
              key={subTask.id}
              onClick={(e) => handleSubTaskClick(subTask, e)}
              title={`${subTask.id} - ${formatStatus(subTask.status, subTask.kanbanColumn)}`}
            >
              <SubTaskContent>
                <SubTaskTitle>{parseTaskTitle(subTask.title)}</SubTaskTitle>
                <SubTaskStatus status={subTask.status}>
                  {formatStatus(subTask.status, subTask.kanbanColumn)}
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
        <TasksList $visible={showTasks}>
          {(() => {
            const statusGroups = groupTasksByStatus(hierarchicalTasks);
            const statusOrder = ['GO MEP', 'Test', 'En Cours', 'TODO'];
            
            return statusOrder.map((status) => (
              <StatusColumn key={status}>
                <StatusColumnHeader $status={status}>
                  {status}
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                    ({statusGroups[status as keyof typeof statusGroups].length})
                  </span>
                </StatusColumnHeader>
                <StatusColumnTasks>
                  {statusGroups[status as keyof typeof statusGroups].length === 0 ? (
                    <EmptyColumnMessage>
                      Aucune tâche {status.toLowerCase()}
                    </EmptyColumnMessage>
                  ) : (
                    statusGroups[status as keyof typeof statusGroups].map((task, index) => 
                      renderHierarchicalTask(task, index, status === 'GO MEP', status)
                    )
                  )}
                </StatusColumnTasks>
              </StatusColumn>
            ));
          })()}
        </TasksList>
      )}
    </TasksContainer>
  );
};

export default TasksListComponent; 