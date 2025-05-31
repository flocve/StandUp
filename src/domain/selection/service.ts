import { Participant, DailyParticipant } from '../participant/entities';

export type SelectionType = 'daily' | 'weekly';

export interface SelectionResult<T extends Participant> {
  winner: T;
  type: SelectionType;
}

export class SelectionService {
  public static selectParticipant<T extends Participant>(
    participants: T[],
    type: SelectionType
  ): SelectionResult<T> {
    if (participants.length === 0) {
      throw new Error('No participants available for selection');
    }

    let selectedParticipant: T;

    if (type === 'weekly') {
      // Pour la sélection hebdomadaire, on utilise le système de diviseur de chance
      // Plus le chiffre est élevé, moins on a de chances d'être sélectionné
      const weightedParticipants = participants.flatMap(participant => {
        const divider = Math.max(1, participant.getPityCounter() || 1); // Éviter la division par 0
        const weight = Math.max(1, Math.floor(100 / divider)); // Plus le diviseur est grand, moins on a de poids
        return Array(weight).fill(participant);
      });
      selectedParticipant = weightedParticipants[
        Math.floor(Math.random() * weightedParticipants.length)
      ];
    } else {
      // Pour la sélection quotidienne, sélection aléatoire simple
      selectedParticipant = participants[
        Math.floor(Math.random() * participants.length)
      ];
    }

    return {
      winner: selectedParticipant,
      type
    };
  }

  public static validateSelection<T extends Participant>(
    participant: T,
    type: SelectionType
  ): boolean {
    if (type === 'daily') {
      if (participant instanceof DailyParticipant) {
        return !participant.hasSpoken();
      }
    }
    return true;
  }
} 