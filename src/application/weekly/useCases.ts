import { Participant } from '../../domain/participant/entities';
import type { ParticipantRepository } from '../../domain/participant/repository';
import { SelectionService } from '../../domain/selection/service';

export class WeeklySelectionUseCases {
  constructor(private participantRepository: ParticipantRepository) {}

  async getAllParticipants(): Promise<Participant[]> {
    return this.participantRepository.getAllWeeklyParticipants();
  }

  async selectWeeklyAnimator(): Promise<Participant> {
    const participants = await this.getAllParticipants();
    
    if (participants.length === 0) {
      throw new Error('No participants available');
    }

    const result = SelectionService.selectParticipant(participants, 'weekly');
    const winner = result.winner;
    
    // Incrémenter SEULEMENT le diviseur du gagnant
    winner.incrementChancePercentage();
    
    // Sauvegarder seulement le gagnant
    await this.participantRepository.updateParticipant(winner);
    
    return winner;
  }

  async getParticipantsPityStatus(): Promise<Participant[]> {
    return this.participantRepository.getAllWeeklyParticipants();
  }

  async addToHistory(participantId: string): Promise<void> {
    await this.participantRepository.addToAnimatorHistory(participantId);
  }
} 