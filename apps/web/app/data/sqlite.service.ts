// --- POCZĄTEK PLIKU: sqlite.service.ts ---

import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { Database } from 'sql.js';
import sqlJs from 'sql.js';

// KROK 1: Importujemy nasz nowy "kontrakt"
// Pamiętaj, aby dostosować ścieżkę, jeśli plik faktoria-data.service.ts jest w innym miejscu.
import { FaktoriaDataService } from '../pages/tools/faktoria/faktoria-data.service';

@Injectable({ providedIn: 'root' })
// KROK 2: Oficjalnie deklarujemy, że ten serwis spełnia warunki naszego "kontraktu"
export class SqliteService implements FaktoriaDataService {
  // --- TA CZĘŚĆ POZOSTAJE BEZ ZMIAN ---
  private dbReady = new BehaviorSubject<boolean>(false);
  private db: Database | null = null;
  private dataChanged = new BehaviorSubject<void>(undefined);

  public dataChanged$ = this.dataChanged.asObservable();

  constructor() {
    this.initDb();
  }

  public notifyChanged() {
    this.dataChanged.next();
  }

  private async initDb() {
    try {
      const SQL = await sqlJs({
        locateFile: file => `/assets/${file}`
      });
      this.db = new SQL.Database();
      this.createTables();
      this.dbReady.next(true);
    } catch (err) {
      console.error('Error initializing SQLite DB', err);
    }
  }

  private createTables() {
    if (!this.db) return;
    const query = `
      CREATE TABLE IF NOT EXISTS market_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itemId TEXT,
        serverId TEXT,
        timestamp TEXT,
        source TEXT,
        fileId TEXT,
        createdAt TEXT,
        expiresAt TEXT,
        tradingCategory TEXT,
        tradingFamily TEXT,
        tradingGroup TEXT,
        gearScore INTEGER,
        tier INTEGER,
        price REAL,
        quantity INTEGER,
        perks TEXT,
        itemName TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_market_data_item_server_ts ON market_data (itemId, serverId, timestamp);
    `;
    this.db.exec(query);
  }

  public async getDb() {
    if (this.dbReady.value) {
      return this.db;
    }
    return firstValueFrom(this.dbReady.pipe(filter(isReady => isReady))).then(() => this.db);
  }
  // --- KONIEC CZĘŚCI BEZ ZMIAN ---


  // KROK 3: Dodajemy nową metodę wymaganą przez "kontrakt"
  // Ta metoda będzie używana przez stronę Faktoria, gdy aplikacja działa w przeglądarce.
  public async getFaktoriaData(options?: { limit: number, offset: number }): Promise<{ success: boolean, data?: any[], error?: string }> {
    console.log('[SqliteService] Getting data from Web Worker...');
    // Zwracamy Promise, który czeka na odpowiedź od naszego "pomocnika" - db.worker.ts
    return new Promise((resolve) => {
      // Tworzymy nowe połączenie z workerem
      const worker = new Worker(new URL('../db.worker.ts', import.meta.url), { type: 'module' });

      // Definiujemy, co ma się stać, gdy worker nam odpowie
      worker.onmessage = ({ data }) => {
        // Interesuje nas tylko odpowiedź na nasze konkretne zapytanie
        if (data.type === 'getFaktoriaData:result') {
          console.log('[SqliteService] Received data from Web Worker:', data.data);
          // Gdy dane nadejdą, zwracamy je jako sukces
          resolve({ success: true, data: data.data });
          // Zamykamy połączenie z workerem, żeby nie zużywał zasobów
          worker.terminate();
        }
      };

      // Wysyłamy do workera prośbę o dane
      worker.postMessage({ type: 'getFaktoriaData' });
    });
  }
}

// --- KONIEC PLIKU: sqlite.service.ts ---