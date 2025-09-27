import { Injectable, inject } from '@angular/core'
import { SqliteService } from '../../data/sqlite.service'

export interface MarketDataRecord {
  id?: number
  source: 'aukcje' | 'kupno'
  timestamp: string
  fileId: string
  createdAt: string
  expiresAt: string
  serverId: string
  tradingCategory: string
  tradingFamily: string
  tradingGroup: string
  itemId: string
  gearScore: number
  tier: number
  price: number
  quantity: number
  perks: string[]
  itemName: string
}

@Injectable({ providedIn: 'root' })
export class MarketDataService {
  private sqlite = inject(SqliteService)

  public async save(records: MarketDataRecord[]) {
    const db = await this.sqlite.getDb()
    if (!db) {
      return
    }

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

    for (const record of records) {
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
    }
    stmt.free();
    this.sqlite.notifyChanged();
  }
}
