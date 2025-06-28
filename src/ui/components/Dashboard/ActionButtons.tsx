import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface ActionButtonsProps {
  onStartStandUp: () => void;
  onSelectAnimator: () => void;
  isLoading?: boolean;
  hasNextWeekAnimator?: boolean;
  className?: string;
}

const buttonHighlight = keyframes`
  0%, 100% {
    box-shadow: 
      0 8px 25px rgba(79, 124, 255, 0.3),
      0 0 0 3px rgba(79, 124, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 12px 35px rgba(79, 124, 255, 0.4),
      0 0 0 3px rgba(79, 124, 255, 0.2);
  }
`;

const buttonUrgentPulse = keyframes`
  0%, 100% {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    box-shadow: 
      0 8px 25px rgba(239, 68, 68, 0.3),
      0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  50% {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    box-shadow: 
      0 12px 35px rgba(239, 68, 68, 0.4),
      0 0 0 3px rgba(239, 68, 68, 0.2);
  }
`;

const urgentBlink = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const ActionButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button<{ 
  $variant: 'primary' | 'secondary'; 
  $highlighted?: boolean;
  $urgent?: boolean;
}>`
  background: ${({ $variant }) => 
    $variant === 'primary' 
      ? 'linear-gradient(135deg, #4f7cff 0%, #7c3aed 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
  };
  border: 2px solid ${({ $variant }) => 
    $variant === 'primary' 
      ? 'rgba(79, 124, 255, 0.3)'
      : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 16px;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  color: white;
  font-family: inherit;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:hover.primary {
    background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
    box-shadow: 0 12px 30px rgba(79, 124, 255, 0.4);
  }
  
  &:hover.secondary {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  ${({ $highlighted }) => $highlighted && css`
    animation: ${buttonHighlight} 2s ease-in-out infinite;
  `}
  
  ${({ $urgent }) => $urgent && css`
    animation: ${buttonUrgentPulse} 1.5s ease-in-out infinite;
  `}
  
  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
  }
`;

const ButtonIcon = styled.div`
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
`;

const ButtonTitle = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonSubtitle = styled.span`
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
`;

const UrgentIndicator = styled.span`
  font-size: 0.8rem;
  animation: ${urgentBlink} 1s ease-in-out infinite;
`;

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onStartStandUp,
  onSelectAnimator,
  isLoading = false,
  hasNextWeekAnimator = false,
  className
}) => {
  // Vérifier si on est jeudi (4) ou vendredi (5)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const isThursdayOrFriday = dayOfWeek === 4 || dayOfWeek === 5;
  
  const shouldHighlightStandUp = isThursdayOrFriday && !hasNextWeekAnimator;
  const shouldHighlightAnimator = isThursdayOrFriday && !hasNextWeekAnimator;

  return (
    <ActionButtonsContainer className={className}>
      <ActionButton
        $variant="primary"
        $highlighted={shouldHighlightStandUp}
        onClick={onStartStandUp}
        disabled={isLoading}
        className="primary"
      >
        <ButtonIcon>🎯</ButtonIcon>
        <ButtonContent>
          <ButtonTitle>Démarrer Stand-up</ButtonTitle>
          <ButtonSubtitle>Sélectionner les speakers</ButtonSubtitle>
        </ButtonContent>
      </ActionButton>

      <ActionButton
        $variant="secondary"
        $urgent={shouldHighlightAnimator}
        onClick={onSelectAnimator}
        disabled={isLoading || hasNextWeekAnimator}
        className="secondary"
      >
        <ButtonIcon>👑</ButtonIcon>
        <ButtonContent>
          <ButtonTitle>
            {hasNextWeekAnimator ? 'Animateur déjà sélectionné' : 'Sélectionner l\'animateur'}
            {isThursdayOrFriday && !hasNextWeekAnimator && (
              <UrgentIndicator>⚠️</UrgentIndicator>
            )}
          </ButtonTitle>
          <ButtonSubtitle>
            {hasNextWeekAnimator ? 'Pour la semaine prochaine' : 
             isThursdayOrFriday ? 'URGENT - Fin de semaine !' : 'Pour la semaine prochaine'}
          </ButtonSubtitle>
        </ButtonContent>
      </ActionButton>
    </ActionButtonsContainer>
  );
}; 