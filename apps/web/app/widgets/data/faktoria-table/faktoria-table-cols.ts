import {
  ItemRarity,
  NW_FALLBACK_ICON,
  getAffixMODs,
  getExclusiveLabelIntersection,
  getItemAttribution,
  getItemExpansion,
  getItemIconPath,
  getItemId,
  getItemMaxGearScore,
  getItemMinGearScore,
  getItemPerkBucketIds,
  getItemRarity,
  getItemRarityLabel,
  getItemRarityWeight,
  getItemSourceShort,
  getItemTierAsRoman,
  getItemTradingFamilyLabel,
  getItemTradingGroupLabel,
  getItemTypeLabel,
  getTradingCategoryLabel,
  isItemArtifact,
  isItemNamed,
  isMasterItem,
  isPerkApplicableToItem,
} from '@nw-data/common'
import {
  AffixStatData,
  CategoricalProgressionData,
  ConsumableItemDefinitions,
  HouseItems,
  ItemCurrencyConversionData,
  MasterItemDefinitions,
  PerkData,
} from '@nw-data/generated'
import { uniq } from 'lodash'
import { RangeFilter } from '~/ui/data/ag-grid'
import { TableGridUtils } from '~/ui/data/table-grid'
import { assetUrl, humanize } from '~/utils'
import { BookmarkCell, TrackGsCell, TrackingCell } from '~/widgets/adapter/components'
import { ItemTrackerFilter } from '~/widgets/item-tracker'
import { ItemTableRecord } from '~/widgets/data/item-table/item-table-cols'

export type FaktoriaTableUtils = TableGridUtils<FaktoriaTableRecord>
export type FaktoriaTableRecord = ItemTableRecord & {
  timestamp_aukcje?: string
  created_at_aukcje?: string
  expires_at_aukcje?: string
  price_aukcje?: number
  quantity_aukcje?: number
  timestamp_kupno?: string
  created_at_kupno?: string
  expires_at_kupno?: string
  price_kupno?: number
  quantity_kupno?: number
}

export function faktoriaColPriceAukcje(util: FaktoriaTableUtils) {
  return util.colDef<number>({
    colId: 'priceAukcje',
    headerValueGetter: () => 'Cena Aukcje',
    field: 'price_aukcje',
    width: 120,
    cellClass: 'text-right',
    filter: 'agNumberColumnFilter',
    valueFormatter: ({ value }) => typeof value === 'number' ? (value / 100).toFixed(2) : '',
  });
}

export function faktoriaColQuantityAukcje(util: FaktoriaTableUtils) {
  return util.colDef<number>({
    colId: 'quantityAukcje',
    headerValueGetter: () => 'Ilość (Aukcje)',
    field: 'quantity_aukcje',
    width: 120,
    cellClass: 'text-right',
    filter: 'agNumberColumnFilter',
  });
}

export function faktoriaColTimestampAukcje(util: FaktoriaTableUtils) {
  return util.colDef<string>({
    colId: 'timestampAukcje',
    headerValueGetter: () => 'Data skanowania (Aukcje)',
    field: 'timestamp_aukcje',
    width: 180,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => value ? value.substring(0, 10) : '',
  });
}

export function faktoriaColCreatedAtAukcje(util: FaktoriaTableUtils) {
  return util.colDef<string>({
    colId: 'createdAtAukcje',
    headerValueGetter: () => 'Data rozpoczęcia (Aukcje)',
    field: 'created_at_aukcje',
    width: 180,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => value ? value.substring(0, 10) : '',
  });
}

export function faktoriaColExpiresAtAukcje(util: FaktoriaTableUtils) {
  return util.colDef<string>({
    colId: 'expiresAtAukcje',
    headerValueGetter: () => 'Data zakończenia (Aukcje)',
    field: 'expires_at_aukcje',
    width: 180,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => value ? value.substring(0, 10) : '',
  });
}

export function faktoriaColPriceKupno(util: FaktoriaTableUtils) {
  return util.colDef<number>({
    colId: 'priceKupno',
    headerValueGetter: () => 'Cena Kupno',
    field: 'price_kupno',
    width: 120,
    cellClass: 'text-right',
    filter: 'agNumberColumnFilter',
    valueFormatter: ({ value }) => typeof value === 'number' ? (value / 100).toFixed(2) : '',
  });
}

export function faktoriaColQuantityKupno(util: FaktoriaTableUtils) {
  return util.colDef<number>({
    colId: 'quantityKupno',
    headerValueGetter: () => 'Ilość (Kupno)',
    field: 'quantity_kupno',
    width: 120,
    cellClass: 'text-right',
    filter: 'agNumberColumnFilter',
  });
}

export function faktoriaColTimestampKupno(util: FaktoriaTableUtils) {
  return util.colDef<string>({
    colId: 'timestampKupno',
    headerValueGetter: () => 'Data skanowania (Kupno)',
    field: 'timestamp_kupno',
    width: 180,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => value ? value.substring(0, 10) : '',
  });
}

export function faktoriaColCreatedAtKupno(util: FaktoriaTableUtils) {
  return util.colDef<string>({
    colId: 'createdAtKupno',
    headerValueGetter: () => 'Data rozpoczęcia (Kupno)',
    field: 'created_at_kupno',
    width: 180,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => value ? value.substring(0, 10) : '',
  });
}

export function faktoriaColExpiresAtKupno(util: FaktoriaTableUtils) {
  return util.colDef<string>({
    colId: 'expiresAtKupno',
    headerValueGetter: () => 'Data zakończenia (Kupno)',
    field: 'expires_at_kupno',
    width: 180,
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => value ? value.substring(0, 10) : '',
  });
}
