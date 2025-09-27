// --- POCZĄTEK PLIKU: faktoria-page.component.ts ---
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FaktoriaDataService } from './faktoria-data.service';

// Importujemy wszystkie moduły, których wymaga szablon HTML
import { DataViewModule } from '~/ui/data/data-view';
import { QuicksearchModule } from '~/ui/quicksearch';
import { LayoutModule } from '~/ui/layout';
import { ScreenshotModule } from '~/widgets/screenshot';
import { PriceImporterModule } from '~/widgets/price-importer';
import { TooltipModule } from '~/ui/tooltip';
import { DataGridModule } from '~/ui/data/table-grid';
import { VirtualGridModule } from '~/ui/data/virtual-grid';

@Component({
  standalone: true,
  selector: 'nwb-faktoria-page',
  templateUrl: './faktoria-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, IonicModule, DataViewModule, QuicksearchModule,
    LayoutModule, TooltipModule, ScreenshotModule, PriceImporterModule,
    DataGridModule, VirtualGridModule
  ],
  host: {
    class: 'layout-col layout-pad'
  }
})
export class FaktoriaPageComponent implements OnInit {
  public tableData: any[] = [];
  protected title = 'Faktoria';
  protected categoryParam = 'category';
  protected selectionParam = 'id';
  protected persistKey = 'faktoria-table';
  protected filterParam = 'filter';

  constructor(protected service: FaktoriaDataService) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    const response = await this.service.getFaktoriaData({ limit: 100, offset: 0 });
    if (response.success) {
      this.tableData = response.data || [];
      // TODO: przekaż `this.tableData` do adaptera tabeli
    } else {
      console.error('Błąd ładowania danych faktoria:', response.error);
    }
  }

  protected category() { return null; }
  protected showSidebar() { return true; }
  protected showModal() { return false; }
}
// --- KONIEC PLIKU: faktoria-page.component.ts ---