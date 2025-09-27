/// <reference lib="webworker" />
import sqlJs, { Database } from 'sql.js';
import * as localforage from 'localforage';

const DB_NAME = 'nw-buddy-db';
const DB_KEY = 'sqlite-db-state';

let db: Database | null = null;

async function initDb() {
  try {
    const SQL = await sqlJs({
      locateFile: (file) => `/assets/${file}`,
    });

    const savedDbState = await localforage.getItem<Uint8Array>(DB_KEY);
    if (savedDbState) {
      db = new SQL.Database(savedDbState);
      console.log('[WORKER] Loaded DB from IndexedDB');
    } else {
      db = new SQL.Database();
      console.log('[WORKER] Created new DB');
    }

    createTables();
    postMessage({ type: 'ready' });
  } catch (err) {
    console.error('Error initializing SQLite DB in worker', err);
    postMessage({ type: 'error', error: err });
  }
}

async function saveDbState() {
  if (db) {
    const binaryArray = db.export();
    await localforage.setItem(DB_KEY, binaryArray);
    console.log('[WORKER] DB state saved to IndexedDB');
  }
}

function createTables() {
  if (!db) return;
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
  db.exec(query);
}


addEventListener('message', async ({ data }) => {
  switch (data.type) {
    case 'init':
      initDb();
      break;
    case 'getKnownFileIds': {
      if (!db) {
        postMessage({ type: 'getKnownFileIds:result', ids: [] });
        return;
      }
      const res = db.exec('SELECT DISTINCT fileId FROM market_data');
      const ids = new Set<string>();
      if (res.length) {
        res[0].values.forEach((row) => {
          ids.add(row[0] as string);
        });
      }
      postMessage({ type: 'getKnownFileIds:result', ids: Array.from(ids) });
      break;
    }
    case 'getFaktoriaData': {
      if (!db) {
        postMessage({ type: 'getFaktoriaData:result', data: [] });
        return;
      }
      const query = `
        WITH AllItems AS (
            SELECT DISTINCT itemId FROM market_data
        ),
        LatestAukcje AS (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY itemId ORDER BY createdAt DESC) as rn
            FROM market_data
            WHERE source = 'aukcje'
        ),
        LatestKupno AS (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY itemId ORDER BY createdAt DESC) as rn
            FROM market_data
            WHERE source = 'kupno'
        )
        SELECT
            i.itemId,
            a.price as price_aukcje,
            a.quantity as quantity_aukcje,
            a.createdAt as created_at_aukcje,
            a.expiresAt as expires_at_aukcje,
            a.timestamp as timestamp_aukcje,
            k.price as price_kupno,
            k.quantity as quantity_kupno,
            k.createdAt as created_at_kupno,
            k.expiresAt as expires_at_kupno,
            k.timestamp as timestamp_kupno
        FROM AllItems i
        LEFT JOIN (SELECT * FROM LatestAukcje WHERE rn = 1) a ON i.itemId = a.itemId
        LEFT JOIN (SELECT * FROM LatestKupno WHERE rn = 1) k ON i.itemId = k.itemId
        WHERE a.expiresAt >= datetime('now') OR k.expiresAt >= datetime('now')
      `;
      const res = db.exec(query);
      if (!res.length) {
        postMessage({ type: 'getFaktoriaData:result', data: [] });
        return;
      }
      const columns = res[0].columns;
      const data = res[0].values.map((row) => {
        const record: any = {};
        columns.forEach((col, i) => (record[col] = row[i]));
        return record;
      });
      postMessage({ type: 'getFaktoriaData:result', data: data });
      break;
    }
    case 'save': {
      if (!db) {
        return;
      }
      const records = data.records || []
      const total = records.length;
      const stmt = db.prepare(`
        INSERT INTO market_data (
          source, timestamp, fileId, createdAt, expiresAt, serverId,
          tradingCategory, tradingFamily, tradingGroup, itemId,
          gearScore, tier, price, quantity, perks, itemName
        ) VALUES (
          :source, :timestamp, :fileId, :createdAt, :expiresAt, :serverId,
          :tradingCategory, :tradingFamily, :tradingGroup, :itemId,
          :gearScore, :tier, :price, :quantity, :perks, :itemName
        )
      `);
      for (let i = 0; i < total; i++) {
        const record = records[i];
        stmt.bind({
          ':source': record.source,
          ':timestamp': record.timestamp,
          ':fileId': record.fileId,
          ':createdAt': record.createdAt,
          ':expiresAt': record.expiresAt,
          ':serverId': record.serverId,
          ':tradingCategory': record.tradingCategory,
          ':tradingFamily': record.tradingFamily,
          ':tradingGroup': record.tradingGroup,
          ':itemId': record.itemId,
          ':gearScore': record.gearScore,
          ':tier': record.tier,
          ':price': record.price,
          ':quantity': record.quantity,
          ':perks': JSON.stringify(record.perks),
          ':itemName': record.itemName,
        });
        stmt.step();
        stmt.reset();

        if ((i + 1) % 100 === 0 || (i + 1) === total) {
          postMessage({ type: 'save:progress', progress: { processed: i + 1, total: total } });
        }
      }
      stmt.free();
      await saveDbState(); // Save DB state after successful save operation
      postMessage({ type: 'save:result' });
      break;
    }
    case 'debug:count_all': {
      if (!db) {
        postMessage({ type: 'debug:count_all:result', count: 0 });
        return;
      }
      const res = db.exec("SELECT COUNT(*) FROM market_data");
      const count = res.length ? res[0].values[0][0] : 0;
      postMessage({ type: 'debug:count_all:result', count: count });
      break;
    }
    case 'debug:get_random': {
      if (!db) {
        postMessage({ type: 'debug:get_random:result', record: null });
        return;
      }
      const res = db.exec("SELECT * FROM market_data ORDER BY RANDOM() LIMIT 1");
      if (!res.length) {
        postMessage({ type: 'debug:get_random:result', record: null });
        return;
      }
      const columns = res[0].columns;
      const record: any = {};
      res[0].values[0].forEach((value, i) => (record[columns[i]] = value));
      postMessage({ type: 'debug:get_random:result', record: record });
      break;
    }
  }
});