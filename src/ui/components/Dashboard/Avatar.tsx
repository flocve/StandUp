import React from 'react';
import styled from 'styled-components';
import { getParticipantPhotoUrlWithTheme, generateFallbackAnimalPhoto } from '../../../utils/animalPhotos';
import { useTheme } from '../../../contexts/ThemeContext';

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showCrown?: boolean;
  crownType?: 'gold' | 'silver';
  className?: string;
}

const AvatarContainer = styled.div<{ $size: string }>`
  position: relative;
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '2rem';
      case 'medium': return '2.5rem';
      case 'large': return '3rem';
      case 'xlarge': return '5rem';
      default: return '2.5rem';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '2rem';
      case 'medium': return '2.5rem';
      case 'large': return '3rem';
      case 'xlarge': return '5rem';
      default: return '2.5rem';
    }
  }};
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarFallback = styled.div<{ $color: string; $size: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color};
  color: white;
  font-weight: 700;
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'small': return '0.8rem';
      case 'medium': return '1rem';
      case 'large': return '1.2rem';
      case 'xlarge': return '2rem';
      default: return '1rem';
    }
  }};
`;

const Crown = styled.div<{ $crownType: 'gold' | 'silver' }>`
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  
  ${({ $crownType }) => $crownType === 'gold' && `
    animation: crownGlow 2s ease-in-out infinite alternate;
  `}
  
  ${({ $crownType }) => $crownType === 'silver' && `
    animation: silverCrownGlow 2s ease-in-out infinite alternate;
    opacity: 0.8;
  `}

  @keyframes crownGlow {
    0% {
      filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.5));
      transform: translateX(-50%) scale(1);
    }
    100% {
      filter: drop-shadow(0 4px 8px rgba(251, 191, 36, 0.8));
      transform: translateX(-50%) scale(1.05);
    }
  }

  @keyframes silverCrownGlow {
    0% {
      filter: drop-shadow(0 2px 4px rgba(192, 192, 192, 0.5));
      transform: translateX(-50%) scale(1);
    }
    100% {
      filter: drop-shadow(0 4px 8px rgba(192, 192, 192, 0.8));
      transform: translateX(-50%) scale(1.05);
    }
  }
`;

export const Avatar: React.FC<AvatarProps> = ({
  name,
  photoUrl,
  size = 'medium',
  showCrown = false,
  crownType = 'gold',
  className
}) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = React.useState(false);
  
  const getAvatarColor = (name: string) => {
    const colors = [
      '#4f7cff', '#7c3aed', '#06b6d4', '#10b981',
      '#f59e0b', '#ef4444', '#8b5cf6', '#06d6a0'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const imageUrl = getParticipantPhotoUrlWithTheme(name, photoUrl, theme);
  const fallbackColor = getAvatarColor(name);

  return (
    <AvatarContainer $size={size} className={className}>
      {showCrown && <Crown $crownType={crownType}>👑</Crown>}
      
      {!imageError ? (
        <AvatarImage
          src={imageUrl}
          alt={name}
          onError={() => setImageError(true)}
        />
      ) : (
        <AvatarFallback $color={fallbackColor} $size={size}>
          {name.charAt(0).toUpperCase()}
        </AvatarFallback>
      )}
    </AvatarContainer>
  );
}; 