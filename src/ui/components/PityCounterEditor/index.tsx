import React from 'react';
import { Participant } from '../../../domain/participant/entities';
import './styles.css';

interface PityCounterEditorProps {
  participants: Participant[];
  onUpdatePityCounter: (participantId: string, newValue: number) => void;
}

export const PityCounterEditor: React.FC<PityCounterEditorProps> = ({
  participants,
  onUpdatePityCounter,
}) => {
  return (
    <div className="pity-editor">
      <h2 className="pity-editor-title">Diviseur de Chance</h2>
      <div className="pity-editor-list">
        {participants.map((participant) => (
          <div key={participant.id.value} className="pity-editor-item">
            <div className="participant-info">
              <span className="participant-name">{participant.name.value}</span>
              <span className="current-pity">
                <span className="pity-star">📉</span>
                {participant.getPityCounter() || 1}
              </span>
            </div>
            <div className="pity-controls">
              <button
                className="pity-button decrease"
                onClick={() => {
                  const newValue = Math.max(1, participant.getPityCounter() - 1);
                  onUpdatePityCounter(participant.id.value, newValue);
                }}
                disabled={participant.getPityCounter() <= 1}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={participant.getPityCounter() || 1}
                onChange={(e) => {
                  const newValue = Math.max(1, parseInt(e.target.value) || 1);
                  onUpdatePityCounter(participant.id.value, newValue);
                }}
                className="pity-input"
              />
              <button
                className="pity-button increase"
                onClick={() => {
                  onUpdatePityCounter(participant.id.value, (participant.getPityCounter() || 1) + 1);
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 