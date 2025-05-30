import React from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  numberOfPieces?: number;
  recycle?: boolean;
  gravity?: number;
  initialVelocityY?: number;
  colors?: string[];
}

export const Confetti: React.FC<ConfettiProps> = ({
  numberOfPieces = 200,
  recycle = false,
  gravity = 0.2,
  initialVelocityY = 20,
  colors = ['#3B82F6', '#8B5CF6', '#60A5FA', '#A78BFA', '#93C5FD']
}) => {
  return (
    <ReactConfetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={numberOfPieces}
      recycle={recycle}
      gravity={gravity}
      initialVelocityY={initialVelocityY}
      colors={colors}
    />
  );
}; 