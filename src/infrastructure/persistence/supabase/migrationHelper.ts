import { Participant } from '../../../domain/participant/entities';
import { ParticipantId } from '../../../domain/participant/valueObjects';
import { ParticipantName } from '../../../domain/participant/valueObjects';

// Participants par défaut de l'application
export const INITIAL_PARTICIPANTS: Participant[] = [
  new Participant(
    new ParticipantId('participant-1'),
    new ParticipantName('Alice')
  ),
  new Participant(
    new ParticipantId('participant-2'),
    new ParticipantName('Bob')
  ),
  new Participant(
    new ParticipantId('participant-3'),
    new ParticipantName('Charlie')
  ),
  new Participant(
    new ParticipantId('participant-4'),
    new ParticipantName('Diana')
  ),
  new Participant(
    new ParticipantId('participant-5'),
    new ParticipantName('Eve')
  ),
  new Participant(
    new ParticipantId('participant-6'),
    new ParticipantName('Frank')
  ),
  new Participant(
    new ParticipantId('participant-7'),
    new ParticipantName('Grace')
  ),
  new Participant(
    new ParticipantId('participant-8'),
    new ParticipantName('Hugo')
  )
]; 