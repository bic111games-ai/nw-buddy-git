import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ComponentStore } from '@ngrx/component-store'
import { NwModule } from '~/nw'
import { IconsModule } from '~/ui/icons'
import { svgSackDollar, svgXmark } from '~/ui/icons/svg'
import { ModalService } from '~/ui/layout'
import { JsonPriceImporterComponent } from './json'
import { NwmpPriceImporterComponent } from './nwmp/price-importer-nwmp.component'
import { MarketDataRecord, MarketDataService } from './market-data.service'

type ImporterType = 'json' | 'nwmp'

import { APP_DB } from '~/data/db';

@Component({
  selector: 'nwb-price-importer',
  templateUrl: './price-importer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NwModule, IconsModule, JsonPriceImporterComponent, NwmpPriceImporterComponent],
  host: {
    class: 'layout-col bg-base-300 border border-base-100 rounded-md relative',
  },
})
export class PriceImporterComponent extends ComponentStore<{
  importer: ImporterType
  data: MarketDataRecord[]
  importing: boolean
}> {
  protected iconClose = svgXmark
  protected iconDollar = svgSackDollar

  protected isJson = this.selectSignal(({ importer }) => importer === 'json')
  protected isNWMP = this.selectSignal(({ importer }) => importer === 'nwmp')
  protected importer = this.selectSignal(({ importer }) => importer)
  protected data = this.selectSignal(({ data }) => data)

  public constructor(
    private modal: ModalService,
    private marketService: MarketDataService,
  ) {
    super({ importer: null, data: null, importing: false })
  }

  protected selectImporter(value: ImporterType) {
    this.patchState({ importer: value, data: null })
  }

  protected onDataReceived(data: MarketDataRecord[]) {
    this.patchState({ data: data })
  }

  protected close() {
    this.modal.close()
  }

  protected async import() {
    try {
      await this.marketService.save(this.data())
      this.modal.close()
      this.modal.showToast({
        message: 'Prices successfully imported',
        duration: 3000,
        position: 'bottom',
        color: 'success',
      })
    } catch (e) {
      console.error(e)
      this.modal.close()
      this.modal.showToast({
        message: 'There was an error while importing prices',
        duration: 5000,
        position: 'bottom',
        color: 'error',
      })
    }
  }
}
