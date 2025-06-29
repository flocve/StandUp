import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';

const backgroundPulse = keyframes`
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.02);
  }
`;

const particlesFloat = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 0.6;
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PeriodSection = styled.div`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(6, 182, 212, 0.08) 50%, 
    rgba(5, 150, 105, 0.06) 100%);
  border: 2px solid rgba(16, 185, 129, 0.2);
  border-radius: 24px;
  padding: 2rem;
  margin: 0;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 0 15px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;
  backdrop-filter: blur(20px);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.03) 0%, transparent 30%),
      radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.02) 0%, transparent 30%),
      linear-gradient(45deg, rgba(147, 51, 234, 0.01) 0%, transparent 50%);
    pointer-events: none;
    animation: ${backgroundPulse} 12s ease-in-out infinite alternate;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 10%;
    width: 150px;
    height: 150px;
    background: 
      radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.04) 2px, transparent 2px),
      radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 50% 20%, rgba(5, 150, 105, 0.02) 1.5px, transparent 1.5px);
    background-size: 40px 40px, 60px 60px, 80px 80px;
    animation: ${particlesFloat} 15s linear infinite;
    pointer-events: none;
    opacity: 0.4;
  }
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

const BlockHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
`;

const BlockEmoji = styled.span`
  font-size: 2rem;
`;

const BlockTitle = styled.h2`
  padding-top: 10px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const WeekBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-tertiary-alpha);
  border: 2px solid var(--accent-tertiary);
  border-radius: 12px;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
  backdrop-filter: blur(8px);
`;

const WeekLabel = styled.span`
  opacity: 0.9;
`;

const WeekNumber = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
`;

const PeriodContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const DateItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const DateLabel = styled.span`
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
`;

const DateValue = styled.span<{ $variant: 'start' | 'end' }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  background: ${props => props.$variant === 'start' 
    ? 'var(--accent-tertiary-alpha)' 
    : 'var(--accent-primary-alpha)'};
  border: ${props => props.$variant === 'start' 
    ? '1px solid var(--accent-tertiary)' 
    : '1px solid var(--accent-primary)'};
  padding: 0.75rem 1rem;
  border-radius: 12px;
  min-width: 80px;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$variant === 'start' 
      ? '0 8px 20px var(--success-glow)' 
      : '0 8px 20px var(--shadow-glow)'};
  }
  
  @media (max-width: 768px) {
    min-width: 100px;
    font-size: 1.125rem;
  }
`;

const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 20px;
  
  @media (max-width: 768px) {
    transform: rotate(90deg);
    width: 20px;
    height: 40px;
  }
`;

const SeparatorLine = styled.div`
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-tertiary), var(--accent-primary));
  border-radius: 1px;
  position: relative;
`;

const SeparatorDot = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, var(--accent-tertiary), var(--accent-primary));
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px var(--success-glow);
`;

const MonthYear = styled.div`
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
`;

const PeriodProgress = styled.div`
  margin-top: 1rem;
  position: relative;
  z-index: 2;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, var(--accent-tertiary), var(--accent-primary));
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  width: ${props => props.$progress}%;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 4px;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  }
`;

const ProgressLabel = styled.div`
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
`;

export const WeekPeriodDisplay: React.FC = () => {
  // Calculer la période de la semaine courante (lundi à vendredi seulement)
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Lundi = début de semaine
    startOfWeek.setDate(diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Vendredi (4 jours après lundi)
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      weekNumber: getWeekNumber(now)
    };
  };

  // Calculer le numéro de semaine
  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Formater la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getCurrentMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Calculer la progression des jours ouvrés (lundi = 1, vendredi = 5)
  const getWorkdayProgress = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi
    
    // Si c'est le weekend, on considère que la semaine est terminée
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 100; // 100% si weekend
    }
    
    // Lundi=1, Mardi=2, Mercredi=3, Jeudi=4, Vendredi=5
    const workday = dayOfWeek; // 1 à 5 pour lundi à vendredi
    return (workday / 5) * 100; // Pourcentage sur 5 jours
  };

  // Générer le label des jours ouvrés
  const getWorkdayLabel = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dimanche, 1=lundi, ..., 6=samedi
    
    // Si c'est le weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "Semaine terminée (5/5)";
    }
    
    // Lundi=1, Mardi=2, Mercredi=3, Jeudi=4, Vendredi=5
    const workday = dayOfWeek;
    return `Jour ${workday} sur 5`;
  };

  const { start, end, weekNumber } = getCurrentWeek();
  const progress = getWorkdayProgress();

  return (
    <PeriodSection>
      <BlockHeader>
        <BlockHeaderLeft>
          <BlockEmoji>📅</BlockEmoji>
          <BlockTitle>Période actuelle</BlockTitle>
        </BlockHeaderLeft>
        <WeekBadge>
          <WeekLabel>Semaine</WeekLabel>
          <WeekNumber>{weekNumber}</WeekNumber>
        </WeekBadge>
      </BlockHeader>
      
      <PeriodContent>
        <DateRange>
          <DateItem>
            <DateLabel>Du</DateLabel>
                            <DateValue $variant="start">{formatDate(start)}</DateValue>
          </DateItem>
          
          <DateSeparator>
            <SeparatorLine />
            <SeparatorDot />
          </DateSeparator>
          
          <DateItem>
            <DateLabel>Au</DateLabel>
                            <DateValue $variant="end">{formatDate(end)}</DateValue>
          </DateItem>
        </DateRange>
        
        <MonthYear>
          {getCurrentMonthYear()}
        </MonthYear>
      </PeriodContent>
      
      <PeriodProgress>
        <ProgressBar>
                          <ProgressFill $progress={progress} />
        </ProgressBar>
        <ProgressLabel>
          {getWorkdayLabel()}
        </ProgressLabel>
      </PeriodProgress>
    </PeriodSection>
  );
}; 