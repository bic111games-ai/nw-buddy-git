// --- POCZĄTEK PLIKU: faktoria-electron.service.ts ---

import { Injectable } from '@angular/core';
import { FaktoriaDataService } from './faktoria-data.service';

// Importujemy główny serwis do komunikacji z Electronem.
// WAŻNE: Sprawdź, czy ta ścieżka jest poprawna dla Twojego projektu!
import { ElectronService } from '../../../electron/electron.service';

@Injectable({ providedIn: 'root' })
export class FaktoriaElectronService implements FaktoriaDataService {
  // W konstruktorze prosimy Angulara, aby dał nam dostęp do głównego serwisu Electrona
  constructor(private electron: ElectronService) {}

  // To jest metoda wymagana przez nasz "kontrakt".
  // Będzie używana przez stronę Faktoria, gdy aplikacja działa w Electronie.
  async getFaktoriaData(options?: { limit: number, offset: number }): Promise<{ success: boolean, data?: any[] }> {
    console.log('[FaktoriaElectronService] Getting data from Electron backend...');
    try {
      // Wywołujemy metodę z naszego głównego serwisu Electrona,
      // która wyśle zapytanie IPC do backendu (do pliku main.ts).
      // Zakładam, że kanał IPC nazywa się 'get-auctions'. Jeśli jest inaczej, zmień go tutaj.
      return await this.electron.getAuctions(options || { limit: 50, offset: 0 });
    } catch (error) {
      console.error('Błąd podczas komunikacji IPC z backendem Electrona', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// --- KONIEC PLIKU: faktoria-electron.service.ts ---