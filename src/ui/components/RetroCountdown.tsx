import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { getRetroInfo } from '../../utils/retroUtils';

interface RetroInfo {
  date: Date;
  daysUntil: number;
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
}

const breathe = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.02);
    opacity: 1;
  }
`;

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

const countdownGlow = keyframes`
  0% {
    text-shadow: 0 0 20px var(--success-glow);
  }
  100% {
    text-shadow: 0 0 30px var(--success-glow), 0 0 40px var(--success-glow);
  }
`;

const progressShimmer = keyframes`
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
`;

const RetroSection = styled.div<{ $status: string }>`
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%, 
    rgba(6, 182, 212, 0.08) 50%, 
    rgba(59, 130, 246, 0.06) 100%);
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
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  
  ${({ $status }) => $status === 'today' && css`
    border-color: rgba(239, 68, 68, 0.3);
    background: linear-gradient(135deg, 
      rgba(239, 68, 68, 0.12) 0%, 
      rgba(245, 158, 11, 0.1) 100%);
    box-shadow: 
      0 10px 25px rgba(0, 0, 0, 0.15),
      0 0 15px rgba(239, 68, 68, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: ${breathe} 1s ease-in-out infinite alternate;
  `}
  
  ${({ $status }) => $status === 'tomorrow' && css`
    border-color: rgba(245, 158, 11, 0.25);
    background: linear-gradient(135deg, 
      rgba(245, 158, 11, 0.1) 0%, 
      rgba(249, 115, 22, 0.08) 100%);
    box-shadow: 
      0 10px 25px rgba(0, 0, 0, 0.15),
      0 0 15px rgba(245, 158, 11, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}
  
  ${({ $status }) => $status === 'soon' && css`
    border-color: rgba(147, 51, 234, 0.25);
    background: linear-gradient(135deg, 
      rgba(147, 51, 234, 0.1) 0%, 
      rgba(168, 85, 247, 0.08) 100%);
    box-shadow: 
      0 10px 25px rgba(0, 0, 0, 0.15),
      0 0 15px rgba(147, 51, 234, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}
  
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
      radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 50% 20%, rgba(147, 51, 234, 0.02) 1.5px, transparent 1.5px);
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

const CountdownContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const CountdownMain = styled.div`
  margin-bottom: 1.5rem;
`;

const CountdownNumber = styled.div<{ $status: string }>`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--success-color) 0%, var(--accent-primary) 50%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  line-height: 1.1;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 8px var(--success-glow);
  
  ${({ $status }) => $status === 'today' && css`
    background: linear-gradient(135deg, var(--error-color) 0%, var(--warning-color) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${countdownGlow} 1s ease-in-out infinite alternate;
  `}
  
  ${({ $status }) => $status === 'tomorrow' && css`
    background: linear-gradient(135deg, var(--warning-color) 0%, var(--accent-primary) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
  
  ${({ $status }) => $status === 'soon' && css`
    background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CountdownDate = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
  text-transform: capitalize;
`;

const CountdownProgress = styled.div`
  margin-top: 1.5rem;
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
`;

const ProgressFill = styled.div<{ progress: number; $status: string }>`
  height: 100%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'today': return 'linear-gradient(90deg, var(--error-color), var(--warning-color))';
      case 'tomorrow': return 'linear-gradient(90deg, var(--warning-color), var(--accent-primary))';
      case 'soon': return 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))';
      default: return 'linear-gradient(90deg, var(--success-color), var(--accent-primary))';
    }
  }};
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  width: ${props => props.progress}%;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: ${progressShimmer} 2s ease-in-out infinite;
  }
`;

export const RetroCountdown: React.FC = () => {
  const [retroInfo, setRetroInfo] = useState<RetroInfo | null>(null);

  useEffect(() => {
    // Fonction pour mettre à jour les informations de la rétro
    const updateRetroInfo = () => {
      const info = getRetroInfo();
      setRetroInfo(info);
    };

    // Mise à jour initiale
    updateRetroInfo();

    // Mise à jour toutes les heures pour rester précis
    const interval = setInterval(updateRetroInfo, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  if (!retroInfo) {
    return null;
  }

  const { daysUntil, formattedDate, isToday, isTomorrow } = retroInfo;

  const getCountdownText = () => {
    if (isToday) {
      return "C'est aujourd'hui !";
    } else if (isTomorrow) {
      return "C'est demain !";
    } else if (daysUntil === 0) {
      return "Rétro terminée";
    } else {
      return `${daysUntil} jour${daysUntil > 1 ? 's' : ''}`;
    }
  };

  const getStatus = () => {
    if (isToday) return 'today';
    if (isTomorrow) return 'tomorrow';
    if (daysUntil <= 3) return 'soon';
    if (daysUntil <= 7) return 'week';
    return 'distant';
  };

  const getEmoji = () => {
    return '⭐';
  };

  const getProgress = () => {
    return Math.max(10, Math.min(90, (30 - daysUntil) / 30 * 100));
  };

  const status = getStatus();

  return (
    <RetroSection $status={status}>
      <BlockHeader>
        <BlockHeaderLeft>
          <BlockEmoji>{getEmoji()}</BlockEmoji>
          <BlockTitle>Prochaine Rétro</BlockTitle>
        </BlockHeaderLeft>
      </BlockHeader>
      
      <CountdownContent>
        <CountdownMain>
          <CountdownNumber $status={status}>
            {getCountdownText()}
          </CountdownNumber>
          <CountdownDate>
            {formattedDate}
          </CountdownDate>
        </CountdownMain>

        {!isToday && !isTomorrow && (
          <CountdownProgress>
            <ProgressBar>
              <ProgressFill 
                progress={getProgress()} 
                $status={status}
              />
            </ProgressBar>
          </CountdownProgress>
        )}
      </CountdownContent>
    </RetroSection>
  );
}; 