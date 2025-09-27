import { GridOptions } from '@ag-grid-community/core'
import { Injectable, inject } from '@angular/core'
import { NW_FALLBACK_ICON, getItemId, getItemPerkBucketIds, getItemPerks, getItemTypeLabel } from '@nw-data/common'
import {
  COLS_CONSUMABLEITEMDEFINITIONS,
  COLS_MASTERITEMDEFINITIONS,
  CategoricalProgressionData,
  MasterItemDefinitions,
} from '@nw-data/generated'
import { uniq } from 'lodash'
import { combineLatest, defer, map, of, startWith, switchMap } from 'rxjs'
import { injectNwData } from '~/data'
import { TranslateService } from '~/i18n'
import { DataViewAdapter, injectDataViewAdapterOptions } from '~/ui/data/data-view'
import { DataTableCategory, TableGridUtils, addGenericColumns } from '~/ui/data/table-grid'
import { VirtualGridOptions } from '~/ui/data/virtual-grid'
import { humanize, selectStream } from '~/utils'
import { ItemCellComponent } from '../item-table/item-cell.component'
import {
  ItemTableRecord,
  itemColAttributeMods,
  itemColBookmark,
  itemColEvent,
  itemColExpansion,
  itemColGearScore,
  itemColIcon,
  itemColItemClass,
  itemColItemId,
  itemColItemType,
  itemColItemTypeName,
  itemColName,
  itemColOwnedWithGS,
  itemColPerkValidity,
  itemColPerks,
  itemColPrice,
  itemColRarity,
  itemColShops,
  itemColSource,
  itemColStockCount,
  itemColTier,
  itemColTradingCategory,
  itemColTradingFamily,
  itemColTradingGroup,
  itemColTransformFrom,
  itemColTransformTo,
} from '../item-table/item-table-cols'
import {
  FaktoriaTableRecord,
  faktoriaColCreatedAtAukcje,
  faktoriaColCreatedAtKupno,
  faktoriaColExpiresAtAukcje,
  faktoriaColExpiresAtKupno,
  faktoriaColPriceAukcje,
  faktoriaColPriceKupno,
  faktoriaColQuantityAukcje,
  faktoriaColQuantityKupno,
  faktoriaColTimestampAukcje,
  faktoriaColTimestampKupno,
} from './faktoria-table-cols'
import { ElectronService } from '~/electron';

@Injectable()
export class FaktoriaTableAdapter implements DataViewAdapter<FaktoriaTableRecord> {
  private db = injectNwData()
  private electron = inject(ElectronService)
  private i18n = inject(TranslateService)
  private config = injectDataViewAdapterOptions<FaktoriaTableRecord>({ optional: true })
  private utils: TableGridUtils<FaktoriaTableRecord> = inject(TableGridUtils)

  public entityID(item: FaktoriaTableRecord): string {
    return item.ItemID.toLowerCase()
  }

  public entityCategories(item: FaktoriaTableRecord): DataTableCategory[] {
    if (!item.ItemType) {
      return null
    }
    return [
      {
        id: item.ItemType.toLowerCase(),
        label: this.i18n.get(getItemTypeLabel(item.ItemType)) || item.ItemType,
        icon: '',
      },
    ]
  }

  public virtualOptions(): VirtualGridOptions<FaktoriaTableRecord> {
    return ItemCellComponent.buildGridOptions()
  }

  public gridOptions(): GridOptions<FaktoriaTableRecord> {
    if (this.config?.gridOptions) {
      return this.config.gridOptions(this.utils)
    }
    return buildCommonFaktoriaGridOptions(this.utils)
  }

  public connect() {
    return this.source$
  }

  private source$ = defer(() => this.fetchData()).pipe(
    map((faktoriaItems) => {
      const filter = this.config?.filter
      if (filter) {
        return faktoriaItems.filter(filter)
      }
      const sort = this.config?.sort
      if (sort) {
        return [...faktoriaItems].sort(sort)
      }
      return faktoriaItems
    })
  )

  private fetchData() {
    return selectStream(
      combineLatest({
        marketData: this.fetchMarketData(),
        itemsMap: this.db.itemsByIdMap(),
        housingMap: this.db.housingItemsByIdMap(),
        perksMap: this.db.perksByIdMap(),
        affixMap: this.db.affixStatsByIdMap(),
        transformsMap: this.db.itemTransformsByIdMap(),
        transformsMapReverse: this.db.itemTransformsByToItemIdMap(),
        conversionMap: this.db.itemCurrencyConversionByItemIdMap(),
        progressionMap: this.db.categoricalProgressionByIdMap(),
        consumablesMap: this.db.consumableItemsByIdMap(),
      }),
      ({
        marketData,
        itemsMap,
        housingMap,
        perksMap,
        affixMap,
        transformsMap,
        transformsMapReverse,
        conversionMap,
        progressionMap,
        consumablesMap,
      }) => {
        return marketData.map((record) => {
          const itemId = record.itemId
          let item: any = itemsMap.get(itemId) || housingMap.get(itemId)
          if (!item) {
            return null
          }
          if (item.HouseItemID) {
            item.ItemID = item.HouseItemID
          }

          const perks = getItemPerks(item, perksMap)
          const conversions = conversionMap.get(getItemId(item)) || []
          const shops = uniq(conversions.map((it) => it.CategoricalProgressionId)).map(
            (id): CategoricalProgressionData => {
              const result = progressionMap.get(id as any)
              if (result) {
                return result
              }
              return {
                CategoricalProgressionId: id as any,
                DisplayName: humanize(id as any),
                IconPath: NW_FALLBACK_ICON,
              } as any
            }
          )

          function getItem(id: string) {
            if (!id) {
              return null
            }
            return itemsMap.get(id) || housingMap.get(id) || ({ ItemID: id } as MasterItemDefinitions)
          }

          return {
            ...(item as any),
            $perks: perks,
            $affixes: perks.map((it) => affixMap.get(it?.Affix)).filter((it) => !!it),
            $perkBuckets: getItemPerkBucketIds(item),
            $transformTo: getItem(transformsMap.get(item.ItemID)?.ToItemId),
            $transformFrom: (transformsMapReverse.get(item.ItemID) || []).map((it) => getItem(it.FromItemId)),
            $consumable: consumablesMap.get(item.ItemID),
            $conversions: conversions,
            $shops: shops,
            price_aukcje: record.price_aukcje,
            quantity_aukcje: record.quantity_aukcje,
            timestamp_aukcje: record.timestamp_aukcje,
            created_at_aukcje: record.created_at_aukcje,
            expires_at_aukcje: record.expires_at_aukcje,
            price_kupno: record.price_kupno,
            quantity_kupno: record.quantity_kupno,
            timestamp_kupno: record.timestamp_kupno,
            created_at_kupno: record.created_at_kupno,
            expires_at_kupno: record.expires_at_kupno,
          }
        }).filter((it) => !!it)
      }
    )
  }

  private fetchMarketData() {
    // Nowe podejście: Pobieranie danych przez Electron IPC
    return combineLatest({
      auctions: defer(() => this.electron.getAuctions()),
      buyOrders: defer(() => this.electron.getBuyOrders()),
    }).pipe(
      map(({ auctions, buyOrders }) => {
        if (!auctions.success || !buyOrders.success) {
          console.error("Błąd pobierania danych z rynku", auctions.error, buyOrders.error);
          return [];
        }

        // Mapowanie danych do wspólnej struktury, którą rozumie reszta adaptera
        const records = new Map<string, any>();

        for (const item of auctions.data) {
          if (!records.has(item.item_id)) {
            records.set(item.item_id, { itemId: item.item_id });
          }
          const record = records.get(item.item_id);
          record.price_aukcje = item.price;
          record.quantity_aukcje = item.quantity;
          record.created_at_aukcje = item.created_at;
          record.expires_at_aukcje = item.expires_at;
          record.timestamp_aukcje = item.timestamp;
        }

        for (const item of buyOrders.data) {
          if (!records.has(item.item_id)) {
            records.set(item.item_id, { itemId: item.item_id });
          }
          const record = records.get(item.item_id);
          record.price_kupno = item.price;
          record.quantity_kupno = item.quantity;
          record.created_at_kupno = item.created_at;
          record.expires_at_kupno = item.expires_at;
          record.timestamp_kupno = item.timestamp;
        }

        return Array.from(records.values());
      })
    );
  }
}

export function buildCommonFaktoriaGridOptions(util: TableGridUtils<FaktoriaTableRecord>) {
  const visibleColumns = [
    'icon',
    'name',
    'priceAukcje',
    'quantityAukcje',
    'createdAtAukcje',
    'expiresAtAukcje',
    'timestampAukcje',
    'priceKupno',
    'quantityKupno',
    'createdAtKupno',
    'expiresAtKupno',
    'timestampKupno',
    'tradingCategory',
    'tradingFamily',
    'tradingGroup',
    'itemType',
    'itemClass',
  ]
  const result: GridOptions<FaktoriaTableRecord> = {
    columnDefs: [
      itemColIcon(util),
      itemColName(util),
      itemColItemId(util),
      itemColPerks(util),
      itemColPerkValidity(util),
      itemColAttributeMods(util),
      itemColRarity(util),
      itemColTier(util),
      itemColItemTypeName(util),
      itemColBookmark(util),
      itemColStockCount(util),
      itemColOwnedWithGS(util),
      itemColPrice(util),
      faktoriaColPriceAukcje(util),
      faktoriaColQuantityAukcje(util),
      faktoriaColTimestampAukcje(util),
      faktoriaColCreatedAtAukcje(util),
      faktoriaColExpiresAtAukcje(util),
      faktoriaColPriceKupno(util),
      faktoriaColQuantityKupno(util),
      faktoriaColTimestampKupno(util),
      faktoriaColCreatedAtKupno(util),
      faktoriaColExpiresAtKupno(util),
      itemColGearScore(util),
      itemColSource(util),
      itemColShops(util),
      itemColEvent(util),
      itemColExpansion(util),
      itemColItemType(util),
      itemColItemClass(util),
      itemColTradingGroup(util),
      itemColTradingFamily(util),
      itemColTradingCategory(util),
      itemColTransformTo(util),
      itemColTransformFrom(util),
    ].map((col) => {
      if (!visibleColumns.includes(col.colId)) {
        col.hide = true
      }
      return col
    }),
  }
  addGenericColumns(result, {
    props: COLS_MASTERITEMDEFINITIONS,
  })
  addGenericColumns(result, {
    props: COLS_CONSUMABLEITEMDEFINITIONS,
    scope: '$consumable',
  })
  return result
}