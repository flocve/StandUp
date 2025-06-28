import React from 'react';
import styled from 'styled-components';
import { ParticipantCard } from './ParticipantCard';

interface TeamSectionProps {
  participants: any[];
  currentAnimator?: any;
  nextAnimator?: any;
  onTeamConfigClick: () => void;
  maxDisplayed?: number;
  className?: string;
}

const SpeakersSection = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 2px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, 
      rgba(79, 124, 255, 0.02) 0%, 
      rgba(124, 58, 237, 0.02) 50%, 
      rgba(6, 182, 212, 0.02) 100%);
    pointer-events: none;
  }
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const BlockHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BlockEmoji = styled.span`
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BlockTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const TeamConfigButton = styled.button`
  background: rgba(79, 124, 255, 0.1);
  border: 2px solid rgba(79, 124, 255, 0.2);
  border-radius: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(79, 124, 255, 0.15);
    border-color: rgba(79, 124, 255, 0.4);
    transform: translateY(-2px) scale(1.05);
  }
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
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const MoreCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  opacity: 0.7;
`;

const MoreLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  opacity: 0.7;
`;

const NoParticipants = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
`;

const NoParticipantsIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
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
    <SpeakersSection className={className}>
      <BlockHeader>
        <BlockHeaderLeft>
          <BlockEmoji>👥</BlockEmoji>
          <BlockTitle>Équipe</BlockTitle>
        </BlockHeaderLeft>
        <TeamConfigButton onClick={onTeamConfigClick} title="Configurer l'équipe">
          ⚙️
        </TeamConfigButton>
      </BlockHeader>

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
          <p>Aucun participant disponible</p>
        </NoParticipants>
      )}
    </SpeakersSection>
  );
}; 