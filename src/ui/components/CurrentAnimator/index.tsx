import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import { getParticipantPhotoUrlWithTheme, generateFallbackAnimalPhoto } from '../../../utils/animalPhotos';
import { useTheme } from '../../../contexts/ThemeContext';
import './styles.css';

interface CurrentAnimatorProps {
  currentAnimator: Participant | null;
}

export const CurrentAnimator: React.FC<CurrentAnimatorProps> = ({
  currentAnimator
}) => {
  const { theme } = useTheme();
  
  if (!currentAnimator) {
    return (
      <div className="current-animator-widget">
        <div className="animator-label">Animateur actuel</div>
        <div className="animator-info">
          <div className="avatar-placeholder">👤</div>
          <div className="animator-name">Aucun animateur</div>
        </div>
      </div>
    );
  }

  return (
    <div className="current-animator-widget">
      <div className="animator-label">Animateur actuel</div>
      <div className="animator-info">
        <div className="avatar-container">
          <img 
            src={getParticipantPhotoUrlWithTheme(
              currentAnimator.name.value, 
              currentAnimator.getPhotoUrl(),
              theme
            )} 
            alt={currentAnimator.name.value}
            className="animator-avatar"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              const fallbackUrl = generateFallbackAnimalPhoto(currentAnimator.name.value);
              if (target.src !== fallbackUrl) {
                target.src = fallbackUrl;
              } else {
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = currentAnimator.name.value.charAt(0);
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                  parent.style.fontSize = '1.5rem';
                  parent.style.fontWeight = '700';
                  parent.style.color = 'white';
                }
              }
            }}
          />
        </div>
        <div className="animator-name">{currentAnimator.name.value}</div>
      </div>
    </div>
  );
}; 