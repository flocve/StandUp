import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { ParticipantId, ParticipantName } from '../../../domain/participant/valueObjects';
import type { ParticipantRepository } from '../../../domain/participant/repository';
import { INITIAL_PARTICIPANTS } from './initialData';

const WEEKLY_PARTICIPANTS_KEY = 'weekly_participants';
const DAILY_PARTICIPANTS_KEY = 'daily_participants';
const PITY_COUNTERS_KEY = 'pity_counters';
const ANIMATOR_HISTORY_KEY = 'animator_history';

interface SerializedParticipant {
  id: string;
  name: string;
  pityCounter: number;
  passageCount: number;
}

interface SerializedDailyParticipant {
  id: string;
  name: string;
  lastParticipation: string | null;
  hasSpoken: boolean;
  speakingOrder: number | null;
}

interface AnimatorHistoryEntry {
  id: string;
  date: string;
}

export class LocalStorageParticipantRepository implements ParticipantRepository {
  constructor() {
    this.initializeIfEmpty();
  }

  private initializeIfEmpty(): void {
    if (!localStorage.getItem(WEEKLY_PARTICIPANTS_KEY)) {
      const serializedParticipants = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        pityCounter: 1,
        passageCount: 0
      }));
      localStorage.setItem(
        WEEKLY_PARTICIPANTS_KEY,
        JSON.stringify(serializedParticipants)
      );
    }

    if (!localStorage.getItem(PITY_COUNTERS_KEY)) {
      const initialPityCounters = INITIAL_PARTICIPANTS.reduce((acc, p) => {
        acc[p.id.value] = 1;
        return acc;
      }, {} as Record<string, number>);
      localStorage.setItem(PITY_COUNTERS_KEY, JSON.stringify(initialPityCounters));
    }

    if (!localStorage.getItem(DAILY_PARTICIPANTS_KEY)) {
      const initialDailyParticipants = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        lastParticipation: null,
        hasSpoken: false,
        speakingOrder: null
      }));
      localStorage.setItem(DAILY_PARTICIPANTS_KEY, JSON.stringify(initialDailyParticipants));
    }

    if (!localStorage.getItem(ANIMATOR_HISTORY_KEY)) {
      localStorage.setItem(ANIMATOR_HISTORY_KEY, JSON.stringify([]));
    }
  }

  private updatePassageCounts(): void {
    const history = JSON.parse(localStorage.getItem(ANIMATOR_HISTORY_KEY) || '[]') as AnimatorHistoryEntry[];
    const passageCounts: Record<string, number> = {};
    
    // Compter le nombre de passages pour chaque participant
    history.forEach(entry => {
      passageCounts[entry.id] = (passageCounts[entry.id] || 0) + 1;
    });

    // Mettre à jour les participants avec leurs nombres de passages
    const participants = JSON.parse(localStorage.getItem(WEEKLY_PARTICIPANTS_KEY) || '[]') as SerializedParticipant[];
    const updatedParticipants = participants.map(p => ({
      ...p,
      passageCount: passageCounts[p.id] || 0
    }));

    localStorage.setItem(WEEKLY_PARTICIPANTS_KEY, JSON.stringify(updatedParticipants));
  }

  async getAllWeeklyParticipants(): Promise<Participant[]> {
    let serializedParticipants = JSON.parse(
      localStorage.getItem(WEEKLY_PARTICIPANTS_KEY) || '[]'
    ) as SerializedParticipant[];

    // Si le tableau est vide, réinitialiser avec les participants initiaux
    if (serializedParticipants.length === 0) {
      const initialParticipants = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        pityCounter: 1,
        passageCount: 0
      }));
      localStorage.setItem(
        WEEKLY_PARTICIPANTS_KEY,
        JSON.stringify(initialParticipants)
      );
      serializedParticipants = initialParticipants;
    }

    // Mettre à jour les compteurs de passages
    this.updatePassageCounts();
    serializedParticipants = JSON.parse(
      localStorage.getItem(WEEKLY_PARTICIPANTS_KEY) || '[]'
    ) as SerializedParticipant[];

    let pityCounters = JSON.parse(
      localStorage.getItem(PITY_COUNTERS_KEY) || '{}'
    ) as Record<string, number>;

    // Si les compteurs de pitié sont vides, les réinitialiser
    if (Object.keys(pityCounters).length === 0) {
      pityCounters = INITIAL_PARTICIPANTS.reduce((acc, p) => {
        acc[p.id.value] = 1;
        return acc;
      }, {} as Record<string, number>);
      localStorage.setItem(PITY_COUNTERS_KEY, JSON.stringify(pityCounters));
    }

    return serializedParticipants.map(
      (p) => {
        const participant = new Participant(
          new ParticipantId(p.id),
          new ParticipantName(p.name),
          pityCounters[p.id] || 1
        );
        participant.setPassageCount(p.passageCount);
        return participant;
      }
    );
  }

  async getAllDailyParticipants(): Promise<DailyParticipant[]> {
    let serializedParticipants = JSON.parse(
      localStorage.getItem(DAILY_PARTICIPANTS_KEY) || '[]'
    ) as SerializedDailyParticipant[];

    // Si le tableau est vide, réinitialiser avec les participants initiaux
    if (serializedParticipants.length === 0) {
      const initialDailyParticipants = INITIAL_PARTICIPANTS.map(p => ({
        id: p.id.value,
        name: p.name.value,
        lastParticipation: null,
        hasSpoken: false,
        speakingOrder: null
      }));
      localStorage.setItem(DAILY_PARTICIPANTS_KEY, JSON.stringify(initialDailyParticipants));
      serializedParticipants = initialDailyParticipants;
    }

    const sortedParticipants = [...serializedParticipants].sort((a, b) => {
      if (a.speakingOrder === null && b.speakingOrder === null) return 0;
      if (a.speakingOrder === null) return 1;
      if (b.speakingOrder === null) return -1;
      return a.speakingOrder - b.speakingOrder;
    });

    return sortedParticipants.map(
      (p) =>
        new DailyParticipant(
          new ParticipantId(p.id),
          new ParticipantName(p.name),
          p.hasSpoken,
          p.lastParticipation ? new Date(p.lastParticipation) : undefined
        )
    );
  }

  async updateParticipant(participant: Participant): Promise<void> {
    const pityCounters = JSON.parse(
      localStorage.getItem(PITY_COUNTERS_KEY) || '{}'
    ) as Record<string, number>;

    pityCounters[participant.id.value] = participant.getPityCounter();
    localStorage.setItem(PITY_COUNTERS_KEY, JSON.stringify(pityCounters));
  }

  async updateDailyParticipant(participant: DailyParticipant): Promise<void> {
    const participants = await this.getAllDailyParticipants();
    
    const currentOrder = participants
      .filter(p => p.hasSpoken())
      .length;

    const updatedParticipants = participants.map((p) => {
      if (p.id.value === participant.id.value) {
        return {
          id: p.id.value,
          name: p.name.value,
          lastParticipation: participant.getLastParticipation()?.toISOString() || null,
          hasSpoken: participant.hasSpoken(),
          speakingOrder: participant.hasSpoken() ? currentOrder + 1 : null
        };
      }
      return {
        id: p.id.value,
        name: p.name.value,
        lastParticipation: p.getLastParticipation()?.toISOString() || null,
        hasSpoken: p.hasSpoken(),
        speakingOrder: p.hasSpoken() ? (JSON.parse(localStorage.getItem(DAILY_PARTICIPANTS_KEY) || '[]') as SerializedDailyParticipant[]).find(sp => sp.id === p.id.value)?.speakingOrder || null : null
      };
    });

    localStorage.setItem(
      DAILY_PARTICIPANTS_KEY,
      JSON.stringify(updatedParticipants)
    );
  }

  async resetDailyParticipants(): Promise<void> {
    const participants = await this.getAllDailyParticipants();
    const resetParticipants = participants.map((p) => ({
      id: p.id.value,
      name: p.name.value,
      lastParticipation: null,
      hasSpoken: false,
      speakingOrder: null
    }));

    localStorage.setItem(
      DAILY_PARTICIPANTS_KEY,
      JSON.stringify(resetParticipants)
    );
  }

  async getParticipantById(id: ParticipantId): Promise<Participant | null> {
    const participants = await this.getAllWeeklyParticipants();
    return participants.find((p) => p.id.value === id.value) || null;
  }

  async updatePityCounter(participantId: string, newValue: number): Promise<void> {
    const pityCounters = JSON.parse(
      localStorage.getItem(PITY_COUNTERS_KEY) || '{}'
    ) as Record<string, number>;

    pityCounters[participantId] = newValue;
    localStorage.setItem(PITY_COUNTERS_KEY, JSON.stringify(pityCounters));
  }

  async getAnimatorHistory(): Promise<AnimatorHistoryEntry[]> {
    return JSON.parse(localStorage.getItem(ANIMATOR_HISTORY_KEY) || '[]');
  }

  async addToAnimatorHistory(participantId: string): Promise<void> {
    const history = await this.getAnimatorHistory();
    history.unshift({ 
      id: participantId,
      date: new Date().toISOString()
    });
    localStorage.setItem(ANIMATOR_HISTORY_KEY, JSON.stringify(history));
    this.updatePassageCounts();
  }
} 