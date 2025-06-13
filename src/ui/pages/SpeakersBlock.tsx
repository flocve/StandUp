import React from 'react';
import { useParticipants } from '../../hooks/useParticipants';
import { DailyParticipant } from '../../domain/participant/entities';

const getNameString = (participantOrName: any) => {
  if (!participantOrName) return '';
  if (typeof participantOrName === 'string') return participantOrName;
  if (typeof participantOrName.name === 'object' && 'value' in participantOrName.name) return participantOrName.name.value;
  if (typeof participantOrName.value === 'string') return participantOrName.value;
  if (typeof participantOrName.name === 'string') return participantOrName.name;
  return '';
};

const getAvatarColor = (name?: string) => {
  if (!name) return { bg: '#4f7cff', text: '#ffffff' };
  const colors = [
    { bg: '#4f7cff', text: '#ffffff' },
    { bg: '#7c3aed', text: '#ffffff' },
    { bg: '#06b6d4', text: '#ffffff' },
    { bg: '#10b981', text: '#ffffff' },
    { bg: '#f59e0b', text: '#ffffff' },
    { bg: '#ef4444', text: '#ffffff' },
    { bg: '#8b5cf6', text: '#ffffff' },
    { bg: '#06d6a0', text: '#ffffff' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
};

interface SpeakersBlockProps {
  allParticipants?: DailyParticipant[];
}

const SpeakersBlock: React.FC<SpeakersBlockProps> = ({ allParticipants = [] }) => {
  const { participants } = useParticipants(allParticipants, 'daily');

  return (
    <div className="speakers-section">
      <h2>Équipe</h2>
      <div className="speakers-grid">
        {participants.length > 0 ? (
          participants.slice(0, 8).map((participant) => {
            const participantName = getNameString(participant);
            const avatarColor = getAvatarColor(participantName);
            const hasPhoto = 'getPhotoUrl' in participant && participant.getPhotoUrl && participant.getPhotoUrl();
            return (
              <div key={String(participant.id?.value || participant.id)} className="speaker-card">
                {hasPhoto ? (
                  <img
                    src={participant.getPhotoUrl()}
                    alt={participantName}
                    className="speaker-avatar"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        target.style.display = 'none';
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'speaker-avatar-fallback';
                        fallbackDiv.style.background = `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`;
                        fallbackDiv.style.color = avatarColor.text;
                        fallbackDiv.textContent = participantName.charAt(0).toUpperCase();
                        parent.insertBefore(fallbackDiv, target);
                      }
                    }}
                  />
                ) : (
                  <div
                    className="speaker-avatar-fallback"
                    style={{
                      background: `linear-gradient(135deg, ${avatarColor.bg}, ${avatarColor.bg}dd)`,
                      color: avatarColor.text
                    }}
                  >
                    {participantName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="speaker-name">{participantName}</span>
                {(participant instanceof DailyParticipant && 
                  (typeof participant.hasSpoken === 'function' ? participant.hasSpoken() : participant.hasSpoken)) && (
                  <div className="speaker-status">✅</div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-participants">
            <div className="no-participants-icon">👥</div>
            <p>Aucun participant disponible</p>
            <p className="no-participants-hint">Les participants apparaîtront ici une fois l'application connectée.</p>
          </div>
        )}
        {participants.length > 8 && (
          <div className="speaker-card more-speakers">
            <div className="more-count">
              +{participants.length - 8}
            </div>
            <span className="speaker-name">autres</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakersBlock; 