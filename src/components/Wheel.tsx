import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { WheelProps, Participant, DailyParticipant } from '../types/wheel';

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#10b981', // emerald
];

const FullScreenConfetti = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000
      }}
    >
      {/* Confetti component removed as per instructions */}
    </div>
  );
};

const Wheel: React.FC<WheelProps> = ({ participants, onSpinEnd, type }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | DailyParticipant | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const spinTimeoutRef = useRef<number | null>(null);
  const confettiTimeoutRef = useRef<number | null>(null);
  const [cards, setCards] = useState<(Participant | DailyParticipant)[]>([]);

  useEffect(() => {
    setCards(participants);
  }, [participants]);

  const cleanupTimeouts = () => {
    if (spinTimeoutRef.current) {
      window.clearTimeout(spinTimeoutRef.current);
    }
    if (confettiTimeoutRef.current) {
      window.clearTimeout(confettiTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning || participants.length === 0) return;

    setIsSpinning(true);
    setShowConfetti(false);
    setSelectedParticipant(null);

    // Durée aléatoire entre 2 et 4 secondes
    const spinDuration = Math.random() * 2000 + 2000;
    let currentIndex = 0;
    const interval = setInterval(() => {
      setSelectedParticipant(participants[currentIndex]);
      currentIndex = (currentIndex + 1) % participants.length;
    }, 100);

    spinTimeoutRef.current = window.setTimeout(() => {
        clearInterval(interval);
      const winner = participants[Math.floor(Math.random() * participants.length)];
      setSelectedParticipant(winner);
      setIsSpinning(false);
      onSpinEnd(winner);

      if (type === 'weekly') {
        setShowConfetti(true);
        confettiTimeoutRef.current = window.setTimeout(() => {
          setShowConfetti(false);
        }, 4000);
      }
    }, spinDuration);
  }, [isSpinning, participants, onSpinEnd, type]);

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <h3 className="text-4xl font-bold mb-8 animate-bounce">🎉</h3>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Tout le monde a participé !
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4">
      {showConfetti && <FullScreenConfetti />}
      
      <div className="cards-container">
        {cards.map((participant) => (
            <div
              key={participant.id}
            className={`card ${
              selectedParticipant
                ? participant.id === selectedParticipant.id
                  ? 'selected'
                  : 'not-selected'
                : ''
            }`}
              style={{
              '--card-color': COLORS[Math.floor(Math.random() * COLORS.length)],
              '--card-color-rgb': '59, 130, 246'
              } as React.CSSProperties}
            >
              <div className="card-content">
              <div className="card-avatar">
                {participant.name.charAt(0)}
                </div>
                <h3 className="card-name">{participant.name}</h3>
              {'pityCounter' in participant && (
                  <div className="pity-counter">
                    <span className="pity-star">⭐</span>
                  <span className="pity-count">{participant.pityCounter}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="selection-button"
      >
        <span>{isSpinning ? 'Sélection...' : 'Sélectionner'}</span>
      </button>
    </div>
  );
};

export default Wheel; 