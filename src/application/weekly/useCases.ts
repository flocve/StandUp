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
    
    // Mettre à jour les compteurs de pity
    const updatedParticipants = participants.map(participant => {
      if (participant.id.value === winner.id.value) {
        participant.resetPityCounter();
      } else {
        participant.incrementPityCounter();
      }
      return participant;
    });

    // Sauvegarder les mises à jour
    await Promise.all(
      updatedParticipants.map(participant =>
        this.participantRepository.updateParticipant(participant)
      )
    );
    
    return winner;
  }

  async getParticipantsPityStatus(): Promise<Participant[]> {
    return this.participantRepository.getAllWeeklyParticipants();
  }
} 