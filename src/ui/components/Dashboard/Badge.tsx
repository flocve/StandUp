import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface BadgeProps {
  count: number;
  type?: 'normal' | 'warning' | 'danger';
  animate?: boolean;
  className?: string;
}

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
`;

const BadgeContainer = styled.div<{ $type: string; $animate: boolean }>`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  border: 2px solid white;
  z-index: 10;
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'normal':
        return 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)';
      case 'danger':
        return 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
      default:
        return 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
    }
  }};
  
  box-shadow: 
    0 3px 12px rgba(0, 0, 0, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  
  ${({ $animate }) => $animate && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 
      0 6px 20px rgba(0, 0, 0, 0.2),
      0 2px 6px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
`;

export const Badge: React.FC<BadgeProps> = ({
  count,
  type = 'normal',
  animate = false,
  className
}) => {
  const getBadgeType = (count: number) => {
    if (count <= 1) return 'normal';
    if (count <= 3) return 'warning';
    return 'danger';
  };

  const badgeType = type === 'normal' ? getBadgeType(count) : type;

  return (
    <BadgeContainer 
      $type={badgeType} 
      $animate={animate}
      className={className}
    >
      {count}
    </BadgeContainer>
  );
}; 