// Alternative : utiliser le CDN pour éviter les problèmes de bundling
import type { Database, SqlJsStatic } from 'sql.js';

class SQLiteDatabase {
  private static instance: SQLiteDatabase;
  private sql: SqlJsStatic | null = null;
  private db: Database | null = null;
  private dbPath = 'wheel_app.db';
  private isMemoryOnly = false;

  private constructor() {}

  public static getInstance(): SQLiteDatabase {
    if (!SQLiteDatabase.instance) {
      SQLiteDatabase.instance = new SQLiteDatabase();
    }
    return SQLiteDatabase.instance;
  }

  // Charger sql.js depuis le CDN
  private async loadSqlJsFromCDN(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Vérifier si sql.js est déjà chargé globalement
      if ((window as any).initSqlJs) {
        resolve((window as any).initSqlJs);
        return;
      }

      // Charger depuis le CDN
      const script = document.createElement('script');
      script.src = 'https://sql.js.org/dist/sql-wasm.js';
      script.onload = () => {
        if ((window as any).initSqlJs) {
          resolve((window as any).initSqlJs);
        } else {
          reject(new Error('sql.js non trouvé après chargement'));
        }
      };
      script.onerror = () => reject(new Error('Impossible de charger sql.js depuis le CDN'));
      document.head.appendChild(script);
    });
  }

  public async initialize(): Promise<void> {
    if (this.db) return; // Déjà initialisé

    console.log('🔄 Initialisation sql.js...');

    try {
      // Essayer UNIQUEMENT le CDN pour éviter les problèmes de bundling Vite
      console.log('🔄 Chargement de sql.js depuis le CDN...');
      const initSqlJs = await this.loadSqlJsFromCDN();
      console.log('✅ sql.js chargé depuis le CDN');

      // Configuration WASM simple
      const wasmConfig = {
        locateFile: (file: string) => {
          if (file === 'sql-wasm.wasm') {
            return `https://sql.js.org/dist/${file}`;
          }
          return file;
        }
      };

      console.log('🔄 Initialisation avec WASM...');
      this.sql = await initSqlJs(wasmConfig);
      console.log('✅ sql.js initialisé avec succès');

      // En mode navigateur, essayer de charger depuis localStorage
      console.log('🌐 Mode navigateur : tentative de chargement depuis localStorage...');
      
      let data: Uint8Array | null = null;
      
      if (typeof window !== 'undefined' && localStorage) {
        const savedDb = localStorage.getItem('sqlite_database');
        if (savedDb) {
          try {
            // Convertir la string base64 en Uint8Array
            const binaryString = atob(savedDb);
            data = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              data[i] = binaryString.charCodeAt(i);
            }
            console.log('📁 Base de données chargée depuis localStorage');
          } catch (error) {
            console.warn('⚠️ Erreur lecture localStorage, création nouvelle base:', error);
            data = null;
          }
        } else {
          console.log('📄 Aucune base sauvegardée, création nouvelle base');
        }
      }

      // Créer la base de données
      if (this.sql) {
        this.db = new this.sql.Database(data);
        
        // Créer les tables si elles n'existent pas
        await this.createTables();
        
        // Sauvegarder immédiatement pour établir la base
        await this.save();
        
        console.log('✅ Base de données SQLite initialisée avec persistance');
      }

    } catch (error) {
      console.error('❌ Échec du chargement sql.js:', error);
      console.error('📝 Veuillez vérifier votre connexion internet');
      throw new Error('Impossible de charger sql.js. Rechargez la page.');
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    const tables = [
      // Table des participants hebdomadaires
      `CREATE TABLE IF NOT EXISTS weekly_participants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        chance_percentage INTEGER NOT NULL DEFAULT 1,
        passage_count INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table des participants quotidiens
      `CREATE TABLE IF NOT EXISTS daily_participants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        last_participation DATETIME,
        has_spoken BOOLEAN NOT NULL DEFAULT 0,
        speaking_order INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table de l'historique des animateurs
      `CREATE TABLE IF NOT EXISTS animator_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id TEXT NOT NULL,
        date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (participant_id) REFERENCES weekly_participants (id)
      )`,

      // Index pour optimiser les requêtes
      `CREATE INDEX IF NOT EXISTS idx_animator_history_participant_id 
       ON animator_history (participant_id)`,
      
      `CREATE INDEX IF NOT EXISTS idx_animator_history_date 
       ON animator_history (date)`,

      `CREATE INDEX IF NOT EXISTS idx_daily_participants_speaking_order 
       ON daily_participants (speaking_order)`
    ];

    for (const tableSQL of tables) {
      this.db.run(tableSQL);
    }
  }

  public getDatabase(): Database {
    if (!this.db) {
      throw new Error('Base de données non initialisée. Appelez initialize() d\'abord.');
    }
    return this.db;
  }

  public async save(): Promise<void> {
    if (!this.db) return;

    try {
      // Obtenir les données binaires de la base
      const data = this.db.export();

      if (typeof window === 'undefined') {
        // En mode Node.js, sauvegarder dans un fichier
        try {
          const fs = await import('fs');
          fs.writeFileSync(this.dbPath, data);
          console.log('💾 Base de données sauvegardée dans', this.dbPath);
        } catch (error) {
          console.warn('⚠️ Impossible d\'écrire sur le disque:', error);
        }
      } else {
        // En mode navigateur, sauvegarder dans localStorage
        try {
          // Convertir Uint8Array en string base64
          let binaryString = '';
          const len = data.byteLength;
          for (let i = 0; i < len; i++) {
            binaryString += String.fromCharCode(data[i]);
          }
          const base64String = btoa(binaryString);
          
          localStorage.setItem('sqlite_database', base64String);
          console.log('💾 Base de données sauvegardée dans localStorage');
        } catch (error) {
          console.warn('⚠️ Erreur sauvegarde localStorage:', error);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.save();
      this.db.close();
      this.db = null;
      console.log('🔒 Base de données fermée');
    }
  }

  // Méthode utilitaire pour les migrations de données depuis localStorage (optionnelle)
  public async migrateFromLocalStorage(): Promise<void> {
    if (!this.db) throw new Error('Base de données non initialisée');

    // Vérifier si on a déjà des données
    const existingData = this.db.exec("SELECT COUNT(*) as count FROM weekly_participants");
    const hasExistingData = existingData[0]?.values?.[0]?.[0];
    if (hasExistingData && Number(hasExistingData) > 0) {
      console.log('📊 Données SQLite déjà présentes, migration ignorée');
      return;
    }

    // Migration optionnelle depuis localStorage (si disponible)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      console.log('🔄 Tentative de migration depuis localStorage...');

      try {
        // Migrer les participants hebdomadaires
        const weeklyData = localStorage.getItem('weekly_participants');
        if (weeklyData) {
          const participants = JSON.parse(weeklyData);
          for (const p of participants) {
            this.db.run(
              `INSERT OR REPLACE INTO weekly_participants 
               (id, name, chance_percentage, passage_count) 
               VALUES (?, ?, ?, ?)`,
              [p.id, p.name, p.chancePercentage || 1, p.passageCount || 0]
            );
          }
          console.log(`✅ ${participants.length} participants hebdomadaires migrés`);
        }

        // Migrer les participants quotidiens
        const dailyData = localStorage.getItem('daily_participants');
        if (dailyData) {
          const participants = JSON.parse(dailyData);
          for (const p of participants) {
            this.db.run(
              `INSERT OR REPLACE INTO daily_participants 
               (id, name, last_participation, has_spoken, speaking_order) 
               VALUES (?, ?, ?, ?, ?)`,
              [
                p.id, 
                p.name, 
                p.lastParticipation, 
                p.hasSpoken ? 1 : 0, 
                p.speakingOrder
              ]
            );
          }
          console.log(`✅ ${participants.length} participants quotidiens migrés`);
        }

        // Migrer l'historique des animateurs
        const historyData = localStorage.getItem('animator_history');
        if (historyData) {
          const history = JSON.parse(historyData);
          for (const entry of history) {
            this.db.run(
              `INSERT INTO animator_history (participant_id, date) 
               VALUES (?, ?)`,
              [entry.id, entry.date]
            );
          }
          console.log(`✅ ${history.length} entrées d'historique migrées`);
        }

        // Migrer les compteurs de chance (pity_counters)
        const pityData = localStorage.getItem('pity_counters');
        if (pityData) {
          const counters = JSON.parse(pityData);
          for (const [participantId, count] of Object.entries(counters)) {
            this.db.run(
              `UPDATE weekly_participants 
               SET chance_percentage = ? 
               WHERE id = ?`,
              [Number(count), participantId]
            );
          }
          console.log(`✅ ${Object.keys(counters).length} compteurs de chance migrés`);
        }

        await this.save();
        console.log('🎉 Migration terminée avec succès !');

      } catch (error) {
        console.error('⚠️ Erreur lors de la migration:', error);
        // Ne pas faire échouer l'initialisation pour autant
      }
    } else {
      console.log('📝 Pas de localStorage disponible pour la migration');
    }
  }

  // Méthode utilitaire pour exporter la base de données
  public exportDatabase(): Uint8Array {
    if (!this.db) throw new Error('Base de données non initialisée');
    return this.db.export();
  }

  // Méthode utilitaire pour importer une base de données
  public async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.sql) throw new Error('SQL.js non initialisé');
    
    if (this.db) {
      this.db.close();
    }
    
    this.db = new this.sql.Database(data);
    console.log('📥 Base de données importée');
  }
}

export default SQLiteDatabase; 