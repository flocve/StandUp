import { Participant, DailyParticipant } from '../../../domain/participant/entities';
import { ParticipantId, ParticipantName } from '../../../domain/participant/valueObjects';
import type { ParticipantRepository } from '../../../domain/participant/repository';
import { INITIAL_PARTICIPANTS } from './migrationHelper';
import SQLiteDatabase from './database';

interface AnimatorHistoryEntry {
  id: string;
  date: string;
}

export class SQLiteParticipantRepository implements ParticipantRepository {
  private db: SQLiteDatabase;

  constructor() {
    this.db = SQLiteDatabase.getInstance();
  }

  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.initializeData();
    // Migrer les données depuis localStorage si c'est la première fois
    await this.db.migrateFromLocalStorage();
  }

  private async initializeData(): Promise<void> {
    const database = this.db.getDatabase();
    
    // Vérifier si on a déjà des participants
    const weeklyCount = database.exec("SELECT COUNT(*) as count FROM weekly_participants");
    if (weeklyCount[0] && weeklyCount[0].values[0] && (weeklyCount[0].values[0][0] as number) > 0) {
      return; // Déjà initialisé
    }

    // Initialiser avec les participants par défaut
    for (const p of INITIAL_PARTICIPANTS) {
      database.run(
        `INSERT OR IGNORE INTO weekly_participants 
         (id, name, chance_percentage, passage_count) 
         VALUES (?, ?, ?, ?)`,
        [p.id.value, p.name.value, 1, 0]
      );

      database.run(
        `INSERT OR IGNORE INTO daily_participants 
         (id, name, last_participation, has_spoken, speaking_order) 
         VALUES (?, ?, ?, ?, ?)`,
        [p.id.value, p.name.value, null, 0, null]
      );
    }

    await this.db.save();
  }

  async getAllWeeklyParticipants(): Promise<Participant[]> {
    const database = this.db.getDatabase();
    
    // Mettre à jour les compteurs de passages depuis l'historique
    await this.updatePassageCounts();
    
    const result = database.exec(`
      SELECT id, name, chance_percentage, passage_count 
      FROM weekly_participants 
      ORDER BY name
    `);

    if (!result[0]) return [];

    return result[0].values.map(row => {
      const participant = new Participant(
        new ParticipantId(row[0] as string),
        new ParticipantName(row[1] as string),
        row[2] as number
      );
      participant.setPassageCount(row[3] as number);
      return participant;
    });
  }

  async getAllDailyParticipants(): Promise<DailyParticipant[]> {
    const database = this.db.getDatabase();
    
    const result = database.exec(`
      SELECT id, name, last_participation, has_spoken, speaking_order 
      FROM daily_participants 
      ORDER BY 
        CASE 
          WHEN speaking_order IS NULL THEN 1 
          ELSE 0 
        END,
        speaking_order ASC,
        name ASC
    `);

    if (!result[0]) return [];

    return result[0].values.map(row => {
      return new DailyParticipant(
        new ParticipantId(row[0] as string),
        new ParticipantName(row[1] as string),
        Boolean(row[3] as number),
        row[2] ? new Date(row[2] as string) : undefined
      );
    });
  }

  async updateParticipant(participant: Participant): Promise<void> {
    const database = this.db.getDatabase();
    
    database.run(
      `UPDATE weekly_participants 
       SET chance_percentage = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [participant.getChancePercentage(), participant.id.value]
    );

    await this.db.save();
  }

  async updateDailyParticipant(participant: DailyParticipant): Promise<void> {
    const database = this.db.getDatabase();
    
    // Calculer l'ordre de passage si le participant vient de parler
    let speakingOrder: number | null = null;
    if (participant.hasSpoken()) {
      const orderResult = database.exec(`
        SELECT COALESCE(MAX(speaking_order), 0) + 1 as next_order
        FROM daily_participants 
        WHERE has_spoken = 1
      `);
      if (orderResult[0] && orderResult[0].values[0]) {
        speakingOrder = orderResult[0].values[0][0] as number;
      }
    }

    database.run(
      `UPDATE daily_participants 
       SET last_participation = ?, 
           has_spoken = ?, 
           speaking_order = ?,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        participant.getLastParticipation()?.toISOString() || null,
        participant.hasSpoken() ? 1 : 0,
        speakingOrder,
        participant.id.value
      ]
    );

    await this.db.save();
  }

  async resetDailyParticipants(): Promise<void> {
    const database = this.db.getDatabase();
    
    database.run(`
      UPDATE daily_participants 
      SET last_participation = NULL, 
          has_spoken = 0, 
          speaking_order = NULL,
          updated_at = CURRENT_TIMESTAMP
    `);

    await this.db.save();
  }

  async getParticipantById(id: ParticipantId): Promise<Participant | null> {
    const database = this.db.getDatabase();
    
    const result = database.exec(`
      SELECT id, name, chance_percentage, passage_count 
      FROM weekly_participants 
      WHERE id = ?
    `, [id.value]);

    if (!result[0] || !result[0].values[0]) return null;

    const row = result[0].values[0];
    const participant = new Participant(
      new ParticipantId(row[0] as string),
      new ParticipantName(row[1] as string),
      row[2] as number
    );
    participant.setPassageCount(row[3] as number);
    return participant;
  }

  async updateChancePercentage(participantId: string, newValue: number): Promise<void> {
    const database = this.db.getDatabase();
    
    database.run(
      `UPDATE weekly_participants 
       SET chance_percentage = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [newValue, participantId]
    );

    await this.db.save();
  }

  async getAnimatorHistory(): Promise<AnimatorHistoryEntry[]> {
    const database = this.db.getDatabase();
    
    const result = database.exec(`
      SELECT ah.participant_id as id, ah.date 
      FROM animator_history ah
      ORDER BY ah.date DESC
    `);

    if (!result[0]) return [];

    return result[0].values.map(row => ({
      id: row[0] as string,
      date: row[1] as string
    }));
  }

  async addToAnimatorHistory(participantId: string): Promise<void> {
    const database = this.db.getDatabase();
    
    database.run(
      `INSERT INTO animator_history (participant_id, date) 
       VALUES (?, ?)`,
      [participantId, new Date().toISOString()]
    );

    await this.updatePassageCounts();
    await this.db.save();
  }

  private async updatePassageCounts(): Promise<void> {
    const database = this.db.getDatabase();
    
    // Mettre à jour les compteurs de passages basés sur l'historique
    database.run(`
      UPDATE weekly_participants 
      SET passage_count = (
        SELECT COUNT(*) 
        FROM animator_history 
        WHERE participant_id = weekly_participants.id
      )
    `);
  }

  // Méthode utilitaire pour nettoyer et fermer la base
  async cleanup(): Promise<void> {
    await this.db.close();
  }
}

export default SQLiteParticipantRepository; 