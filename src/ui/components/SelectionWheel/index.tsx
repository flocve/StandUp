import React from 'react';
import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { DailySelection } from '../DailySelection';
import { AnimatorSelection } from '../AnimatorSelection';
import type { SelectionType } from '../../../domain/selection/service';
import type { WeeklySelectionUseCases } from '../../../application/weekly/useCases';
import type { DailySelectionUseCases } from '../../../application/daily/useCases';
import './styles.css';

interface SelectionWheelProps {
  participants: (Participant | DailyParticipant)[];
  onSelect: (winner: Participant | DailyParticipant) => void;
  type: SelectionType;
  onUpdateChancePercentage?: (participantId: string, newValue: number) => void;
  allParticipants?: DailyParticipant[];
  repository?: any;
  weeklyUseCases?: WeeklySelectionUseCases;
  dailyUseCases?: DailySelectionUseCases;
  currentAnimator?: Participant | null;
}

export const SelectionWheel: React.FC<SelectionWheelProps> = ({
  participants,
  onSelect,
  type,
  onUpdateChancePercentage,
  allParticipants,
  repository,
  weeklyUseCases,
  dailyUseCases,
  currentAnimator
}) => {
  if (participants.length === 0) {
    return (
      <div className="completion-container">
        <div className="completion-emojis">
          <span className="completion-emoji">🎉</span>
          <span className="completion-emoji" style={{ animationDelay: '0.3s' }}>🎊</span>
        </div>
        <h3 className="completion-title">
          Tout le monde a participé !
        </h3>
        <p className="completion-subtitle">
          Une nouvelle journée, de nouvelles discussions !
        </p>
      </div>
    );
  }

  return (
    <div className="selection-container">
      <div className="selection-content">
        {type === 'daily' ? (
          <DailySelection
            participants={participants as DailyParticipant[]}
            onSelect={onSelect as (winner: DailyParticipant) => void}
            allParticipants={allParticipants}
            dailyUseCases={dailyUseCases}
            currentAnimator={currentAnimator}
          />
        ) : (
          repository && onUpdateChancePercentage && weeklyUseCases && (
            <AnimatorSelection
              participants={participants as Participant[]}
              onSelect={onSelect as (winner: Participant) => void}
              onUpdateChancePercentage={onUpdateChancePercentage}
              repository={repository}
              weeklyUseCases={weeklyUseCases}
            />
          )
        )}
      </div>
    </div>
  );
}; 