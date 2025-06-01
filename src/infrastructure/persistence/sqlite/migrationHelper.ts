// Aide à la migration depuis localStorage (récupération des données initiales)
import { Participant } from '../../../domain/participant/entities';
import { ParticipantId, ParticipantName } from '../../../domain/participant/valueObjects';

// Participants initiaux (copiés depuis l'ancienne structure)
export const INITIAL_PARTICIPANTS = [
  new Participant(
    new ParticipantId('1'),
    new ParticipantName('Grégory'),
    1
  ),
  new Participant(
    new ParticipantId('2'),
    new ParticipantName('Lewis'),
    1
  ),
  new Participant(
    new ParticipantId('3'),
    new ParticipantName('Emilie'),
    1
  ),
  new Participant(
    new ParticipantId('4'),
    new ParticipantName('Simon'),
    1
  ),
  new Participant(
    new ParticipantId('5'),
    new ParticipantName('Kevin'),
    1
  ),
  new Participant(
    new ParticipantId('6'),
    new ParticipantName('Florian'),
    1
  ),
  new Participant(
    new ParticipantId('7'),
    new ParticipantName('Rachid'),
    1
  ),
  new Participant(
    new ParticipantId('8'),
    new ParticipantName('Luciano'),
    1
  ),
  // ✅ AJOUTEZ VOS NOUVEAUX PARTICIPANTS ICI :
  // new Participant(
  //   new ParticipantId('9'),
  //   new ParticipantName('Votre Nom'),
  //   1
  // ),
]; 