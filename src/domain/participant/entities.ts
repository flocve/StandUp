import { ParticipantId, ParticipantName } from './valueObjects';

export class Participant {
  private passageCount: number = 0;

  constructor(
    public readonly id: ParticipantId,
    public readonly name: ParticipantName,
    private chancePercentage: number = 1,
    public readonly photoUrl?: string
  ) {}

  public getChancePercentage(): number {
    return this.chancePercentage;
  }

  public getPhotoUrl(): string | undefined {
    return this.photoUrl;
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
    private lastParticipation?: Date,
    photoUrl?: string
  ) {
    super(id, name, 1, photoUrl);
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