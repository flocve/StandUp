import { DailyParticipant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import { SelectionService } from '../../domain/selection/service';

export class DailySelectionUseCases {
  constructor(private participantRepository: ParticipantRepository) {}

  async getAvailableParticipants(): Promise<DailyParticipant[]> {
    const participants = await this.participantRepository.getAllDailyParticipants();
    return participants.filter(p => !p.hasSpoken());
  }

  async selectNextParticipant(): Promise<DailyParticipant> {
    const availableParticipants = await this.getAvailableParticipants();
    
    if (availableParticipants.length === 0) {
      throw new Error('No participants available');
    }

    const result = SelectionService.selectParticipant(availableParticipants, 'daily');
    const winner = result.winner;
    
    winner.markAsSpoken();
    await this.participantRepository.updateDailyParticipant(winner);
    
    return winner;
  }

  async resetAllParticipants(): Promise<void> {
    await this.participantRepository.resetDailyParticipants();
  }

  async updateParticipant(participant: DailyParticipant): Promise<void> {
    await this.participantRepository.updateDailyParticipant(participant);
  }

  async getParticipantsStatus(): Promise<DailyParticipant[]> {
    return this.participantRepository.getAllDailyParticipants();
  }
} 