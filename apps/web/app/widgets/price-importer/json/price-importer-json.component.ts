import { CommonModule } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, EventEmitter, inject, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ComponentStore } from '@ngrx/component-store'
import { defer, forkJoin, map, Observable, tap } from 'rxjs'
import { MarketDataRecord } from '../market-data.service'

import { injectNwData } from '~/data'
import { DataViewModule, provideDataView } from '~/ui/data/data-view'
import { DataGridModule } from '~/ui/data/table-grid'
import { IconsModule } from '~/ui/icons'
import { svgCircleNotch } from '~/ui/icons/svg'
import { JsonPriceTableAdapter } from './json-price-table-adapter'
import { JsonPriceItem } from './types'

export interface JsonImporterState {
  url?: string
  files?: FileList
  data?: MarketDataRecord[]
  rows?: JsonPriceItem[]
  isLoading?: boolean
  isComplete?: boolean
  hasError?: boolean
}
@Component({
  selector: 'nwb-price-importer-json',
  templateUrl: './price-importer-json.component.html',
  imports: [CommonModule, FormsModule, DataViewModule, DataGridModule, IconsModule],
  providers: [
    provideDataView({
      adapter: JsonPriceTableAdapter,
    }),
  ],
  host: {
    class: 'layout-col',
  },
})
export class JsonPriceImporterComponent extends ComponentStore<JsonImporterState> {
  private db = injectNwData()
  private http = inject(HttpClient)
  private adapter = inject(JsonPriceTableAdapter)

  @Output()
  protected dataReceived = new EventEmitter<MarketDataRecord[]>()

  protected files$ = this.selectSignal(({ files }) => files)
  protected url$ = this.selectSignal(({ url }) => url)
  protected rows$ = this.selectSignal(({ rows }) => rows)
  protected girdOptions = this.adapter.gridOptions()

  protected isLoading$ = this.selectSignal(({ isLoading }) => isLoading)
  protected hasError$ = this.selectSignal(({ hasError }) => hasError)

  protected showFileInput$ = this.selectSignal(({ data, rows }) => !data && !rows)

  protected iconSpin = svgCircleNotch

  public constructor() {
    super({
      files: null,
      url: null,
    })
  }

  protected useFile(e: Event) {
    this.patchState({
      files: (e.target as HTMLInputElement)?.files,
      url: null,
    })
  }

  protected useUrl(e: Event) {
    this.patchState({
      files: null,
      url: (e.target as HTMLInputElement)?.value,
    })
  }

  protected loadFromFiles(files: FileList) {
    const sources$ = Array.from(files || []).map((file) => {
      return defer(() => this.readFile(file)).pipe(
        map((data) => {
          const source = file.name.toLowerCase().includes('aukcje') ? 'aukcje' : 'kupno'
          const fileId = crypto.randomUUID()
          return data.map((record: any) => {
            return {
              source: source,
              fileId: fileId,
              timestamp: record.timestamp ?? '',
              createdAt: record.created_at ?? '',
              expiresAt: record.expires_at ?? '',
              serverId: record.server_id ?? '',
              tradingCategory: record.trading_category ?? '',
              tradingFamily: record.trading_family ?? '',
              tradingGroup: record.trading_group ?? '',
              itemId: record.item_id ?? '',
              itemName: record.item_name ?? '',
              gearScore: record.gear_score ?? 0,
              tier: record.tier ?? 0,
              price: record.price ?? 0,
              quantity: record.quantity ?? 0,
              perks: record.perks ?? [],
            } as MarketDataRecord
          })
        })
      )
    })
    this.load(forkJoin(sources$).pipe(map((it) => it.flat(1))))
  }

  protected loadFromUrl(url: string) {
    const source$ = this.loadUrl(url).pipe(
      map((data) => {
        const source = url.toLowerCase().includes('aukcje') ? 'aukcje' : 'kupno'
        const fileId = crypto.randomUUID()
        return data.map((record: any) => {
          return {
            source: source,
            fileId: fileId,
            timestamp: record.timestamp ?? '',
            createdAt: record.created_at ?? '',
            expiresAt: record.expires_at ?? '',
            serverId: record.server_id ?? '',
            tradingCategory: record.trading_category ?? '',
            tradingFamily: record.trading_family ?? '',
            tradingGroup: record.trading_group ?? '',
            itemId: record.item_id ?? '',
            itemName: record.item_name ?? '',
            gearScore: record.gear_score ?? 0,
            tier: record.tier ?? 0,
            price: record.price ?? 0,
            quantity: record.quantity ?? 0,
            perks: record.perks ?? [],
          } as MarketDataRecord
        })
      })
    )
    this.load(source$)
  }

  protected load(source$: Observable<MarketDataRecord[]>) {
    source$
      .pipe(
        tap({
          subscribe: () => {
            this.patchState({
              isLoading: true,
              data: null,
              rows: null,
              hasError: false,
            })
          },
        }),
        tap({
          next: (data) => {
            this.patchState({
              isLoading: false,
              hasError: false,
              data: data,
            })
            this.dataReceived.emit(data)
          },
          error: (e) => {
            console.error(e)
            this.patchState({
              isLoading: false,
              hasError: true,
            })
          },
        })
      )
      .subscribe()
  }

  private readFile(file: File): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          resolve(JSON.parse(reader.result as string))
        } catch (e) {
          reject(e)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  private loadUrl(url: string) {
    return this.http.get<any[]>(url, {
      responseType: 'json',
    })
  }
}
