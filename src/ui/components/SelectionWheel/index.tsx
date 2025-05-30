import React, { useState, useCallback, useEffect } from 'react';
import type { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { ParticipantCard } from '../ParticipantCard';
import { Confetti } from '../Confetti';
import type { SelectionType } from '../../../domain/selection/service';
import './styles.css';

interface SelectionWheelProps {
  participants: (Participant | DailyParticipant)[];
  onSelect: (winner: Participant | DailyParticipant) => void;
  type: SelectionType;
  activeParticipants?: (Participant | DailyParticipant)[];  // Liste des participants actifs dans l'ordre
}

export const SelectionWheel: React.FC<SelectionWheelProps> = ({
  participants,
  onSelect,
  type,
  activeParticipants = []
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | DailyParticipant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [prevParticipant, setPrevParticipant] = useState<string | null>(null);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (selectedParticipant) {
      setPrevParticipant(selectedParticipant.name.value);
    }
  }, [selectedParticipant]);

  // Prendre le dernier participant actif de la liste
  const lastActiveParticipant = activeParticipants && activeParticipants.length > 0 
    ? activeParticipants[activeParticipants.length - 1] 
    : null;

  const handleSelection = useCallback(() => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);
    setShowConfetti(false);
    setSelectedParticipant(null);

    let currentIndex = 0;
    const interval = setInterval(() => {
      setSelectedParticipant(participants[currentIndex]);
      currentIndex = (currentIndex + 1) % participants.length;
    }, 100);

    const spinDuration = Math.random() * 2000 + 2000;
    setTimeout(() => {
      clearInterval(interval);
      const winner = participants[Math.floor(Math.random() * participants.length)];
      setSelectedParticipant(winner);
      setIsSpinning(false);
      onSelect(winner);

      if (type === 'weekly') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }, spinDuration);
  }, [isSpinning, participants, onSelect, type]);

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center completion-container">
        <div className="flex justify-center mb-8">
          <span className="completion-emoji">🎉</span>
          <span className="completion-emoji" style={{ animationDelay: '0.3s' }}>🎊</span>
        </div>
        <h3 className="completion-title">
          Tout le monde a participé !
        </h3>
        <p className="completion-subtitle">
          Une nouvelle journée, de nouvelles discussions !
        </p>
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none',
          perspective: '1000px'
        }}>
          <Confetti
            numberOfPieces={250}
            recycle={false}
            gravity={0.25}
            initialVelocityY={30}
            colors={['#3B82F6', '#8B5CF6', '#60A5FA', '#A78BFA', '#93C5FD', '#EC4899']}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4" style={{ paddingTop: '4rem' }}>
      {showConfetti && <Confetti />}
      
      {lastActiveParticipant && (
        <div className="text-center" style={{ 
          marginBottom: '5rem',
          marginTop: '3rem',
          padding: '3rem 2rem',
          background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
          borderRadius: '2rem',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.3)'
        }}>
          <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">
            A toi de parler
          </div>
          <div 
            className={isFirstRender ? 'name-enter' : 'name-update'}
            style={{ 
              fontSize: 'clamp(5rem, 15vw, 12rem)',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #60A5FA 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: `
                -1px -1px 0 rgba(255,255,255,0.4),
                1px -1px 0 rgba(255,255,255,0.4),
                -1px 1px 0 rgba(255,255,255,0.4),
                1px 1px 0 rgba(255,255,255,0.4),
                0 0 50px rgba(147, 51, 234, 0.6),
                0 0 100px rgba(59, 130, 246, 0.4)
              `,
              letterSpacing: '-0.05em',
              lineHeight: '1',
              padding: '1.5rem 0',
              margin: '0 auto',
              maxWidth: '95vw',
              wordBreak: 'break-word',
              position: 'relative',
              WebkitTextStroke: '2px rgba(255,255,255,0.2)',
              willChange: 'transform, opacity, filter',
              transform: 'perspective(1000px)',
              transformStyle: 'preserve-3d'
            }}
            key={lastActiveParticipant.name.value}
          >
            <div style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              right: '-10%',
              bottom: '-20%',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #60A5FA 100%)',
              opacity: 0.15,
              filter: 'blur(40px)',
              borderRadius: '2rem',
              transform: 'scale(1.2) translateZ(-50px)',
              zIndex: -1
            }} />
            {lastActiveParticipant.name.value}
          </div>
        </div>
      )}

      <div className="text-center" style={{ marginBottom: '4rem', marginTop: '4rem' }}>
        <button
          onClick={handleSelection}
          disabled={isSpinning}
          className="selection-button"
        >
          {isSpinning ? 'Sélection...' : 'Sélectionner'}
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 180px)', 
        gap: '2rem', 
        justifyContent: 'center',
        marginTop: '2rem'
      }}>
        {participants.map((participant) => (
          <ParticipantCard
            key={participant.id.value}
            participant={participant}
            isSelected={selectedParticipant?.id.value === participant.id.value}
            isAnimating={isSpinning}
          />
        ))}
      </div>
    </div>
  );
}; 