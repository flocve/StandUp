import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ParticipantCard } from './ParticipantCard';

interface TeamSectionProps {
  participants: any[];
  currentAnimator?: any;
  nextAnimator?: any;
  onTeamConfigClick: () => void;
  maxDisplayed?: number;
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

const TeamSectionContainer = styled.div`
  background: linear-gradient(135deg, 
    rgba(147, 51, 234, 0.1) 0%, 
    rgba(168, 85, 247, 0.08) 50%, 
    rgba(59, 130, 246, 0.06) 100%);
  border: 2px solid rgba(147, 51, 234, 0.2);
  border-radius: 24px;
  padding: 2rem;
  margin: 0;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 0 15px rgba(147, 51, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 85% 15%, rgba(147, 51, 234, 0.03) 0%, transparent 30%),
      radial-gradient(circle at 15% 85%, rgba(59, 130, 246, 0.02) 0%, transparent 30%),
      linear-gradient(45deg, rgba(16, 185, 129, 0.01) 0%, transparent 50%);
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
      radial-gradient(circle at 30% 30%, rgba(147, 51, 234, 0.04) 2px, transparent 2px),
      radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.02) 1.5px, transparent 1.5px);
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

const TeamConfigButton = styled.button`
  background: var(--accent-secondary-alpha);
  border: 2px solid var(--accent-secondary);
  border-radius: 12px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  z-index: 2;
  
  &:hover {
    background: var(--accent-secondary);
    color: white;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px var(--shadow-glow);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const TeamContent = styled.div`
  position: relative;
  z-index: 2;
`;

const SpeakersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MoreSpeakers = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }
`;

const MoreCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  opacity: 0.9;
`;

const MoreLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0.8;
`;

const NoParticipants = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-secondary);
  position: relative;
  z-index: 2;
`;

const NoParticipantsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  animation: ${breathe} 2s ease-in-out infinite alternate;
`;

const NoParticipantsText = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  opacity: 0.8;
`;

export const TeamSection: React.FC<TeamSectionProps> = ({
  participants,
  currentAnimator,
  nextAnimator,
  onTeamConfigClick,
  maxDisplayed = 8,
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

  const displayedParticipants = participants.slice(0, maxDisplayed);
  const remainingCount = Math.max(0, participants.length - maxDisplayed);

  return (
    <TeamSectionContainer className={className}>
      <BlockHeader>
        <BlockHeaderLeft>
          <BlockEmoji>👥</BlockEmoji>
          <BlockTitle>Équipe</BlockTitle>
        </BlockHeaderLeft>
        <TeamConfigButton onClick={onTeamConfigClick} title="Configurer l'équipe">
          ⚙️
        </TeamConfigButton>
      </BlockHeader>

      <TeamContent>
        {participants.length > 0 ? (
          <SpeakersGrid>
            {displayedParticipants.map((participant) => {
              const participantName = getNameString(participant);
              const isCurrentAnimator = currentAnimator && getNameString(currentAnimator) === participantName;
              const isNextAnimator = nextAnimator && getNameString(nextAnimator) === participantName;

              return (
                <ParticipantCard
                  key={String(participant.id?.value || participant.id)}
                  name={participantName}
                  photoUrl={participant?.getPhotoUrl?.()}
                  passageCount={participant?.getPassageCount?.() || 0}
                  isCurrentAnimator={isCurrentAnimator}
                  isNextAnimator={isNextAnimator}
                />
              );
            })}

            {remainingCount > 0 && (
              <MoreSpeakers>
                <MoreCount>+{remainingCount}</MoreCount>
                <MoreLabel>autres</MoreLabel>
              </MoreSpeakers>
            )}
          </SpeakersGrid>
        ) : (
          <NoParticipants>
            <NoParticipantsIcon>👥</NoParticipantsIcon>
            <NoParticipantsText>Aucun participant disponible</NoParticipantsText>
          </NoParticipants>
        )}
      </TeamContent>
    </TeamSectionContainer>
  );
}; 