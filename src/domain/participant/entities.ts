import { ParticipantId, ParticipantName } from './valueObjects';

export class Participant {
  private passageCount: number = 0;

  constructor(
    public readonly id: ParticipantId,
    public readonly name: ParticipantName,
    private chancePercentage: number = 1
  ) {}

  public getChancePercentage(): number {
    return this.chancePercentage;
  }

  public incrementChancePercentage(): void {
    this.chancePercentage += 1;
  }

  public resetChancePercentage(): void {
    this.chancePercentage = 1;
  }

  public getPassageCount(): number {
    return this.passageCount;
  }

  public setPassageCount(count: number): void {
    this.passageCount = count;
  }

  public incrementPassageCount(): void {
    this.passageCount += 1;
  }
}

export class DailyParticipant extends Participant {
  constructor(
    id: ParticipantId,
    name: ParticipantName,
    private hasSpokenFlag: boolean = false,
    private lastParticipation?: Date
  ) {
    super(id, name);
  }

  public hasSpoken(): boolean {
    return this.hasSpokenFlag;
  }

  public getLastParticipation(): Date | undefined {
    return this.lastParticipation;
  }

  public markAsSpoken(): void {
    this.hasSpokenFlag = true;
    this.lastParticipation = new Date();
  }

  public reset(): void {
    this.hasSpokenFlag = false;
    this.lastParticipation = undefined;
  }
} 