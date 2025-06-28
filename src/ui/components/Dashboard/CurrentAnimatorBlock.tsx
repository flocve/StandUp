import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Avatar } from './Avatar';
import { useTheme } from '../../../contexts/ThemeContext';

interface CurrentAnimatorBlockProps {
  currentAnimator: any;
  nextAnimator?: any;
  passageCount?: number;
  className?: string;
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

const AnimatorSection = styled.div`
  background: var(--accent-gradient);
  border: 3px solid var(--accent-primary);
  border-radius: 24px;
  padding: 2rem;
  margin: 0;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.4),
    0 0 30px var(--shadow-glow),
    inset 0 2px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 85% 15%, var(--accent-primary-alpha) 0%, transparent 30%),
      radial-gradient(circle at 15% 85%, var(--accent-secondary-alpha) 0%, transparent 30%),
      linear-gradient(45deg, var(--accent-tertiary-alpha) 0%, transparent 50%);
    pointer-events: none;
    animation: ${backgroundPulse} 8s ease-in-out infinite alternate;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 10%;
    width: 200px;
    height: 200px;
    background: 
      radial-gradient(circle at 30% 30%, var(--accent-primary-alpha) 2px, transparent 2px),
      radial-gradient(circle at 70% 70%, var(--accent-secondary-alpha) 1px, transparent 1px),
      radial-gradient(circle at 50% 20%, var(--accent-tertiary-alpha) 1.5px, transparent 1.5px);
    background-size: 40px 40px, 60px 60px, 80px 80px;
    animation: ${particlesFloat} 12s linear infinite;
    pointer-events: none;
    opacity: 0.6;
  }
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
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

const AnimatorCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 2;
`;

const AnimatorInfo = styled.div`
  text-align: left;
  flex: 1;
`;

const AnimatorName = styled.h3`
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 0.3rem 0;
  letter-spacing: -0.01em;
`;

const AnimatorRole = styled.p`
  font-size: 1.15rem;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.85;
  font-weight: 500;
`;

const AnimatorBadges = styled.div`
  margin-top: 0.7rem;
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Badge = styled.div`
  background: var(--accent-primary-alpha);
  border: 2px solid var(--accent-primary);
  border-radius: 12px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(8px);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const BadgeIcon = styled.div`
  font-size: 1.2rem;
`;

const BadgeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BadgeLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  opacity: 0.8;
`;

const BadgeValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const NextAnimatorDiscreet = styled.div`
  position: absolute;
  bottom: 1.2rem;
  right: 1.2rem;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 1.2rem;
  padding: 0.4rem 0.8rem;
  z-index: 2;
  backdrop-filter: blur(8px);
  
  @media (max-width: 768px) {
    display: none !important;
  }
`;

const NextAnimatorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const NextAnimatorLabel = styled.div`
  font-weight: 500;
  font-size: 0.93rem;
  opacity: 0.8;
`;

const NextAnimatorName = styled.div`
  font-weight: 700;
`;

const NoAnimator = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NoAnimatorIcon = styled.div`
  font-size: 3rem;
  opacity: 0.5;
`;

export const CurrentAnimatorBlock: React.FC<CurrentAnimatorBlockProps> = ({
  currentAnimator,
  nextAnimator,
  passageCount = 0,
  className
}) => {
  const getNameString = (participantOrName: any) => {
    if (!participantOrName) return '';
    if (typeof participantOrName === 'string') return participantOrName;
    if (typeof participantOrName.name === 'object' && 'value' in participantOrName.name) 
      return participantOrName.name.value;
    if (typeof participantOrName.value === 'string') return participantOrName.value;
    if (typeof participantOrName.name === 'string') return participantOrName.name;
    return '';
  };

  const getPhotoUrl = (participant: any) => {
    return participant?.getPhotoUrl?.() || undefined;
  };

  return (
    <AnimatorSection className={className}>
      <BlockHeader>
        <BlockHeaderLeft>
          <BlockEmoji>👑</BlockEmoji>
          <BlockTitle>Animateur actuel</BlockTitle>
        </BlockHeaderLeft>
      </BlockHeader>

      {currentAnimator ? (
        <AnimatorCard>
          <Avatar
            name={getNameString(currentAnimator)}
            photoUrl={getPhotoUrl(currentAnimator)}
            size="xlarge"
            showCrown={true}
            crownType="gold"
          />
          
          <AnimatorInfo>
            <AnimatorName>{getNameString(currentAnimator) || 'Animateur'}</AnimatorName>
            <AnimatorRole>En fonction cette semaine</AnimatorRole>
          </AnimatorInfo>
          <AnimatorBadges>
              <Badge>
                <BadgeIcon>🎯</BadgeIcon>
                <BadgeContent>
                  <BadgeLabel>A animé</BadgeLabel>
                  <BadgeValue>{passageCount} fois</BadgeValue>
                </BadgeContent>
              </Badge>
            </AnimatorBadges>

        </AnimatorCard>
      ) : (
        <NoAnimator>
          <NoAnimatorIcon>👤</NoAnimatorIcon>
          <AnimatorInfo>
            <AnimatorName>Aucun animateur</AnimatorName>
            <AnimatorRole>Sélectionnez un animateur</AnimatorRole>
          </AnimatorInfo>
        </NoAnimator>
      )}
        {nextAnimator && (
          <NextAnimatorDiscreet>
            <Avatar
              name={getNameString(nextAnimator)}
              photoUrl={getPhotoUrl(nextAnimator)}
              size="small"
            />
            <NextAnimatorInfo>
              <NextAnimatorLabel>Prochain animateur</NextAnimatorLabel>
              <NextAnimatorName>{getNameString(nextAnimator)}</NextAnimatorName>
            </NextAnimatorInfo>
          </NextAnimatorDiscreet>
        )}
    </AnimatorSection>
  );
}; 