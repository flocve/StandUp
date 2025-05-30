import { Participant } from '../../../domain/participant/entities';
import { ParticipantId } from '../../../domain/participant/valueObjects';
import { ParticipantName } from '../../../domain/participant/valueObjects';

export const INITIAL_PARTICIPANTS = [
  new Participant(
    new ParticipantId('1'),
    new ParticipantName('Florian')
  ),
  new Participant(
    new ParticipantId('2'),
    new ParticipantName('Emilie')
  ),
  new Participant(
    new ParticipantId('3'),
    new ParticipantName('Luciano')
  ),
  new Participant(
    new ParticipantId('4'),
    new ParticipantName('Simon')
  ),
  new Participant(
    new ParticipantId('5'),
    new ParticipantName('Kevin')
  ),
  new Participant(
    new ParticipantId('6'),
    new ParticipantName('Grégory')
  ),
  new Participant(
    new ParticipantId('7'),
    new ParticipantName('Rachid')
  ),
  new Participant(
    new ParticipantId('8'),
    new ParticipantName('Lewis')
  ),
]; 