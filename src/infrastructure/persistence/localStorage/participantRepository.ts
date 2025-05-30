import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { ParticipantId, ParticipantName } from '../../../domain/participant/valueObjects';
import type { ParticipantRepository } from '../../../domain/participant/repository';
import { INITIAL_PARTICIPANTS } from './initialData';

const WEEKLY_PARTICIPANTS_KEY = 'weekly_participants';
const DAILY_PARTICIPANTS_KEY = 'daily_participants';

interface SerializedParticipant {
  id: string;
  name: string;
  pityCounter: number;
}

interface SerializedDailyParticipant extends SerializedParticipant {
  hasSpoken: boolean;
  lastParticipation?: string;
}

export class LocalStorageParticipantRepository implements ParticipantRepository {
  constructor() {
    this.initializeIfEmpty();
  }

  private async initializeIfEmpty(): Promise<void> {
    const weeklyData = localStorage.getItem(WEEKLY_PARTICIPANTS_KEY);
    if (!weeklyData) {
      localStorage.setItem(
        WEEKLY_PARTICIPANTS_KEY,
        JSON.stringify(INITIAL_PARTICIPANTS.map(p => this.serializeParticipant(p)))
      );
    }

    const dailyData = localStorage.getItem(DAILY_PARTICIPANTS_KEY);
    if (!dailyData) {
      const dailyParticipants = INITIAL_PARTICIPANTS.map(p => 
        new DailyParticipant(p.id, p.name)
      );
      localStorage.setItem(
        DAILY_PARTICIPANTS_KEY,
        JSON.stringify(dailyParticipants.map(p => this.serializeDailyParticipant(p)))
      );
    }
  }

  private deserializeParticipant(data: SerializedParticipant): Participant {
    return new Participant(
      new ParticipantId(data.id),
      new ParticipantName(data.name),
      data.pityCounter
    );
  }

  private deserializeDailyParticipant(data: SerializedDailyParticipant): DailyParticipant {
    return new DailyParticipant(
      new ParticipantId(data.id),
      new ParticipantName(data.name),
      data.hasSpoken,
      data.lastParticipation ? new Date(data.lastParticipation) : undefined
    );
  }

  private serializeParticipant(participant: Participant): SerializedParticipant {
    return {
      id: participant.id.value,
      name: participant.name.value,
      pityCounter: participant.getPityCounter()
    };
  }

  private serializeDailyParticipant(participant: DailyParticipant): SerializedDailyParticipant {
    const base = this.serializeParticipant(participant);
    return {
      ...base,
      hasSpoken: participant.hasSpoken(),
      lastParticipation: participant.getLastParticipation()?.toISOString()
    };
  }

  async getAllWeeklyParticipants(): Promise<Participant[]> {
    const data = localStorage.getItem(WEEKLY_PARTICIPANTS_KEY);
    if (!data) return [];
    
    const serialized = JSON.parse(data) as SerializedParticipant[];
    return serialized.map(p => this.deserializeParticipant(p));
  }

  async getAllDailyParticipants(): Promise<DailyParticipant[]> {
    const data = localStorage.getItem(DAILY_PARTICIPANTS_KEY);
    if (!data) return [];
    
    const serialized = JSON.parse(data) as SerializedDailyParticipant[];
    return serialized.map(p => this.deserializeDailyParticipant(p));
  }

  async updateParticipant(participant: Participant): Promise<void> {
    const participants = await this.getAllWeeklyParticipants();
    const updated = participants.map(p => 
      p.id.value === participant.id.value ? participant : p
    );
    localStorage.setItem(
      WEEKLY_PARTICIPANTS_KEY,
      JSON.stringify(updated.map(p => this.serializeParticipant(p)))
    );
  }

  async updateDailyParticipant(participant: DailyParticipant): Promise<void> {
    const participants = await this.getAllDailyParticipants();
    const updated = participants.map(p => 
      p.id.value === participant.id.value ? participant : p
    );
    localStorage.setItem(
      DAILY_PARTICIPANTS_KEY,
      JSON.stringify(updated.map(p => this.serializeDailyParticipant(p)))
    );
  }

  async resetDailyParticipants(): Promise<void> {
    const participants = await this.getAllDailyParticipants();
    participants.forEach(p => p.reset());
    localStorage.setItem(
      DAILY_PARTICIPANTS_KEY,
      JSON.stringify(participants.map(p => this.serializeDailyParticipant(p)))
    );
  }

  async getParticipantById(id: ParticipantId): Promise<Participant | null> {
    const weeklyParticipants = await this.getAllWeeklyParticipants();
    const dailyParticipants = await this.getAllDailyParticipants();
    
    return (
      weeklyParticipants.find(p => p.id.value === id.value) ||
      dailyParticipants.find(p => p.id.value === id.value) ||
      null
    );
  }
} 