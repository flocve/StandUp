export class ParticipantId {
  constructor(private readonly _value: string) {
    if (!_value) {
      throw new Error('ParticipantId cannot be empty');
    }
  }

  get value(): string {
    return this._value;
  }
}

export class ParticipantName {
  constructor(private readonly _value: string) {
    if (!_value) {
      throw new Error('ParticipantName cannot be empty');
    }
  }

  get value(): string {
    return this._value;
  }
} 