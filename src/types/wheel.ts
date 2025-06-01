export interface Participant {
  id: string;
  name: string;
  chancePercentage: number;
}

export interface DailyParticipant extends Participant {
  lastParticipation?: Date;
  hasSpoken: boolean;
}

export interface WheelProps {
  participants: (Participant | DailyParticipant)[];
  onSpinEnd: (winner: Participant | DailyParticipant) => void;
  type: 'daily' | 'weekly';
} 