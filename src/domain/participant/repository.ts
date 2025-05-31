import { Participant, DailyParticipant } from './entities';
import { ParticipantId } from './valueObjects';

export interface ParticipantRepository {
  getAllWeeklyParticipants(): Promise<Participant[]>;
  getAllDailyParticipants(): Promise<DailyParticipant[]>;
  updateParticipant(participant: Participant): Promise<void>;
  updateDailyParticipant(participant: DailyParticipant): Promise<void>;
  resetDailyParticipants(): Promise<void>;
  getParticipantById(id: ParticipantId): Promise<Participant | null>;
  updatePityCounter(participantId: string, newValue: number): Promise<void>;
  addToAnimatorHistory(participantId: string): Promise<void>;
} 