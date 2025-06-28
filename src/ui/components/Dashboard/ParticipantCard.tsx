import React from 'react';
import styled, { css } from 'styled-components';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

interface ParticipantCardProps {
  name: string;
  photoUrl?: string;
  passageCount?: number;
  isCurrentAnimator?: boolean;
  isNextAnimator?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card = styled.div<{ 
  $isCurrentAnimator: boolean; 
  $isNextAnimator: boolean; 
  $clickable: boolean; 
}>`
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  
  ${({ $clickable }) => $clickable && css`
    cursor: pointer;
  `}
  
  ${({ $isCurrentAnimator }) => $isCurrentAnimator && css`
    border: 2px solid #3b82f6;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
    box-shadow: 
      0 6px 16px rgba(59, 130, 246, 0.2),
      0 0 0 1px rgba(59, 130, 246, 0.3);
  `}
  
  ${({ $isNextAnimator, $isCurrentAnimator }) => $isNextAnimator && !$isCurrentAnimator && css`
    border: 2px solid #9333ea;
    background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    box-shadow: 
      0 6px 16px rgba(147, 51, 234, 0.2),
      0 0 0 1px rgba(147, 51, 234, 0.3);
  `}
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, 
      rgba(79, 124, 255, 0.05) 0%, 
      rgba(124, 58, 237, 0.05) 50%, 
      rgba(6, 182, 212, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const ParticipantName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ParticipantInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
`;

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  name,
  photoUrl,
  passageCount = 0,
  isCurrentAnimator = false,
  isNextAnimator = false,
  className,
  onClick
}) => {
  const showCrown = isCurrentAnimator || isNextAnimator;
  const crownType = isCurrentAnimator ? 'gold' : 'silver';

  return (
    <Card
      $isCurrentAnimator={isCurrentAnimator}
      $isNextAnimator={isNextAnimator}
      $clickable={!!onClick}
      className={className}
      onClick={onClick}
    >
      <AvatarContainer>
        <Avatar
          name={name}
          photoUrl={photoUrl}
          size="medium"
          showCrown={showCrown}
          crownType={crownType}
        />
        {passageCount > 0 && (
          <Badge
            count={passageCount}
            animate={passageCount > 3}
          />
        )}
      </AvatarContainer>
      
      <ParticipantInfo>
        <ParticipantName>{name}</ParticipantName>
      </ParticipantInfo>
    </Card>
  );
}; 