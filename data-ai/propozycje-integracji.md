### ***Propozycja nr 1*** ###

## 1. Analiza struktury i danych

1. Zgromadź wszystkie pliki JSON z drive’a — sprawdź ich strukturę (klucze, zagnieżdżenia, relacje między plikami).

2. Zmapuj encje (być może „item”, „perk”, „datasheet”, „gearset”, itp.).

3. Zidentyfikuj zależności między encjami (np. item → perk, gearset → item, etc.).

4. Określ jakie pola muszą być indeksowane (filtracje, wyszukiwanie, sortowanie).

---

## 2. Projekt schematu SQLite

Na podstawie analizy stwórz model relacyjny. Przykład:

| Tabela       | Klucz główny | Pola                   | Relacje / uwagi         |
| ------------ | ------------ | ---------------------- | ----------------------- |
| `items`      | `id`         | nazwa, opis, rarity, … | powiązanie do `perks`   |
| `perks`      | `id`         | typ, wartość, opis     | może być wiele dla item |
| `gearsets`   | `id`         | nazwa, bonusy          | many-to-many z items    |
| `datasheets` | `id`         | dane techniczne        | itp.                    |
| ...          | ...          | ...                    | ...                     |

Dla tabel many-to-many (np. gearsets ↔ items) stwórz tabelę połączeniową: `gearset_items (gearset_id, item_id)`.

Dodaj indeksy na kolumnach często używanych w WHERE / JOIN (np. `name`, `rarity`, `perk_type`).

---

## 3. Import danych JSON → SQLite w Go

1. Przy starcie aplikacji (lub przy pierwszym uruchomieniu) sprawdź, czy plik bazy istnieje.

2. Jeśli nie istnieje:

   * Utwórz plik `app.db`.
   * Utwórz tabele zgodnie ze schematem.
   * Wczytaj JSON-y (np. z katalogu `data/json/`).
   * W transakcji `BEGIN` → wstawiaj rekordy → `COMMIT`.

3. Jeżeli baza istnieje, możesz sprawdzić wersję schematu i ewentualnie wykonać migracje (np. z `migrations/001_add_column.sql`, `002_new_table.sql`…).

4. Obsłuż błędy: brakujące pliki JSON, struktury różnych wersji.

---

## 4. Warstwa API w Go

Stwórz API, które Angular/Electron będą wywoływać:

* **GET /items** — lista wszystkich itemów (z paginacją, filtrami)
* **GET /items/:id** — szczegóły itemu, łącznie z perkami
* **GET /gearsets** — lista gearsetów
* **GET /gearsets/:id** — szczegóły gearsetu + powiązane itemy
* **GET /datasheets** / **GET /datasheets/:id**
* (opcjonalnie) **POST /refresh-data** — endpoint, który powoduje ponowny import JSON do SQLite

Zastosuj DTO (struktury Go) by nie ujawniać wewnętrznych kolumn lub formatów bazy.

---

## 5. Integracja z Electron + Angular

1. **Uruchomienie backendu Go przy starcie aplikacji Electron**

   * Możesz uruchomić binarkę Go jako proces child w Electronie lub dołączyć backend do warstwy Node/Electron.
   * Upewnij się, że serwer nasłuchuje lokalnie, np. `http://127.0.0.1:PORT`.

2. **Angular — konsumowanie API**

   * Serwis HttpClient w Angular: `ItemService`, `GearsetService`, itp.
   * W komponentach ładowanie danych z API i wyświetlanie.
   * Ewentualnie caching (localStorage, IndexedDB) dla szybkości.

3. **Ścieżka pliku bazy**

   * W Electronie ustal folder aplikacji (`app.getPath('userData')`) i tam przechowuj `app.db`.

   * Zadbaj, by Go wiedział, gdzie szukać pliku bazy (np. przekazując ścieżkę jako argument lub poprzez zmienną środowiskową).

---

## 6. Migracje i aktualizacje danych

* W katalogu `migrations/` trzymaj pliki SQL, które zmieniają schemat (dodawanie kolumn, tabele, itp.).

* W kodzie Go: narzędzie migracji (np. `golang-migrate`) do uruchamiania migracji przy starcie, jeśli wersja bazy jest niższa niż wersja aplikacji.

* Przy zmianie struktury JSON (np. nowe pola) — zaktualizuj parser JSON → adaptuj migracje, jeśli potrzebne.

---

## 7. Plan krok po kroku (etapy)

1. **Eksploracja danych JSON** → mapowanie struktur.

2. **Model relacyjny / schemat bazy**.

3. **Implementacja importera JSON → SQLite w Go**.

4. **Tworzenie API w Go** (endpointy, DTO).

5. **Integracja z Electronem / uruchamianie backendu**.

6. **Angular: pisanie serwisów i komponentów konsumujących API**.

7. **Obsługa migracji / aktualizacji danych JSON**.

8. **Testy: duże JSON-y, filtrowanie, wyszukiwanie, błędy**.

9. **Optymalizacje: indeksy, lazily loading, paginacja**.


### ***Propozycja nr 2*** ###


1. **Instalacja**: `npm install sqlite3 --save`

2. **Main process (apps/electron/main.ts)**: Dodaj:
   ```typescript
   import { app, ipcMain } from 'electron';
   import sqlite3 from 'sqlite3';
   let db: sqlite3.Database;

   ipcMain.handle('open-db', (_, path: string) => {
     db = new sqlite3.Database(path);
     return 'DB opened';
   });

   ipcMain.handle('query-db', async (_, sql: string, params: any[]) => {
     return new Promise((resolve, reject) => {
       db.all(sql, params, (err, rows) => {
         if (err) reject(err);
         else resolve(rows);
       });
     });
   });
   ```

3. **Preload (apps/electron/preload.ts)**: Eksportuj IPC:
   ```typescript
   import { contextBridge, ipcRenderer } from 'electron';
   contextBridge.exposeInMainWorld('electronAPI', {
     openDb: (path: string) => ipcRenderer.invoke('open-db', path),
     queryDb: (sql: string, params: any[]) => ipcRenderer.invoke('query-db', sql, params)
   });
   ```

4. **ElectronService (apps/web/app/electron/electron.service.ts)**: Dodaj metody:
   ```typescript
   import { Injectable } from '@angular/core';

   @Injectable({ providedIn: 'root' })
   export class ElectronService {
     openDb(path: string): Promise<string> {
       return (window as any).electronAPI.openDb(path);
     }

     queryDb(sql: string, params: any[] = []): Promise<any[]> {
       return (window as any).electronAPI.queryDb(sql, params);
     }
   }
   ```

5. **DbService (apps/web/app/data/db.service.ts)**: Integruj:
   ```typescript
   import { ElectronService } from '~/app/electron/electron.service';

   // W metodach używaj this.electronService.queryDb(...)
   ```

6. **Testy**: W electron.service.spec.ts dodaj:
   ```typescript
   it('queries DB', async () => {
     spyOn((window as any).electronAPI, 'queryDb').and.returnValue(Promise.resolve([]));
     expect(await service.queryDb('SELECT * FROM table')).toEqual([]);
   });
   ```

### ***Propozycja nr 3*** ###

Plan Integracji Bazy Danych SQLite
  Krok 1: Analiza Danych i Stworzenie Schematu Bazy
  Najpierw musimy zrozumieć, z jakimi danymi pracujemy, aby optymalnie zaprojektować strukturę bazy.


   1. Zbadam strukturę plików JSON: Wczytam i przeanalizuję pliki 2025-09-17_Aries-Aukcje-sample.json oraz 2025-09-17_Aries-Kupno-sample.json.
  Stworzymy narzędzie, które przeniesie dane z plików JSON do naszej nowej bazy. Będzie to operacja wykonywana tylko raz (lub gdy pojawią się
  nowe, duże pliki z danymi).


   1. Napiszę skrypt importujący: Użyję do tego Pythona lub Node.js. Skrypt będzie:
  Krok 3: Logika Bazy Danych w Procesie Głównym Electrona (Backend)
  To jest serce naszego rozwiązania. Cała komunikacja z bazą danych będzie odbywać się w bezpiecznym procesie głównym Electrona, który ma
  dostęp do systemu plików.


   1. Dodam bibliotekę SQLite: Zainstaluję w projekcie sprawdzoną bibliotekę do obsługi SQLite w Node.js, np. better-sqlite3.
  Krok 4: Pobieranie Danych w Aplikacji Angular (Frontend)
  Na koniec nauczymy komponent /faktoria, jak prosić o dane proces główny Electrona, zamiast czytać plik JSON.


   1. Stworzę serwis w Angularze: Utworzę DatabaseService, który będzie pomostem komunikacyjnym. Będzie on miał prostą metodę, np.
      wykonajZapytanie(sql), która wyśle zapytanie do procesu głównego przez ipcRenderer.invoke('zapytanie-do-bazy', sql).
  Korzyści z tego podejścia:
     Wydajność:* Aplikacja będzie startować natychmiast, a dane będą ładowane dynamicznie w ułamku sekundy.
     Skalowalność:* Rozwiązanie będzie działać płynnie nawet z dziesiątkami milionów rekordów.
     Bezpieczeństwo:* Zachowamy ścisły podział między bezpiecznym procesem głównym a procesem renderowania, zgodnie z najlepszymi praktykami
  Electrona.
  
### ***Propozycja nr 4*** ###

## Plan Integracji z Bazą Danych SQLite dla Projektu "NW Faktoria"

### 1. Cel Główny

Zastąpienie obecnego mechanizmu ładowania danych giełdowych (prawdopodobnie opartego o pliki JSON) wydajnym systemem opartym na lokalnej bazie danych SQLite. Aplikacja w wersji desktopowej (Electron) będzie odpytywać bazę danych w celu wyświetlenia i filtrowania danych na stronie `/faktoria`.

### 2. Kluczowe Technologie i Architektura

*   **Baza Danych:** SQLite (jeden plik, np. `faktoria.sqlite`).
*   **Import Danych:** Skrypt w Pythonie (zgodnie z wytycznymi projektu) do jednorazowego importu danych z plików JSON do bazy SQLite.
*   **Backend (Dostęp do Bazy):** **Proces główny Electrona (Main Process)**. Jest to środowisko Node.js, które ma bezpośredni dostęp do systemu plików i może bezpiecznie zarządzać połączeniem z bazą danych.
*   **Frontend (Prezentacja Danych):** Aplikacja Angular (`FaktoriaPageComponent`).
*   **Komunikacja:** Komunikacja międzyprocesowa (IPC) w Electronie (`ipcMain` i `ipcRenderer`) do przesyłania żądań i danych między frontendem a backendem.

### 3. Analiza Danych i Projekt Bazy Danych

Przeanalizowałem pliki `Aries-Aukcje.json` i `Aries-Kupno.json`. Są to listy obiektów reprezentujących aktywne oferty na giełdzie.

**Proponowana struktura bazy danych (w pliku `faktoria.sqlite`):**

1.  **Tabela: `aukcje` (Listings/Sell Orders)**
    *   `id` TEXT PRIMARY KEY (z pola `id` w JSON)
    *   `item_id` TEXT NOT NULL
    *   `item_name` TEXT
    *   `price` REAL NOT NULL
    *   `quantity` INTEGER NOT NULL
    *   `gear_score` INTEGER
    *   `tier` INTEGER
    *   `perks` TEXT (przechowywany jako string JSON)
    *   `timestamp` TEXT

2.  **Tabela: `zlecenia_kupna` (Buy Orders)**
    *   `id` TEXT PRIMARY KEY
    *   `item_id` TEXT NOT NULL
    *   `item_name` TEXT
    *   `price` REAL NOT NULL
    *   `quantity` INTEGER NOT NULL
    *   `gear_score` INTEGER
    *   `tier` INTEGER
    *   `perks` TEXT (przechowywany jako string JSON)
    *   `timestamp` TEXT

### 4. Szczegółowy Plan Działania

#### Faza 1: Przygotowanie Bazy Danych (Skrypt w Pythonie)

Ten krok wykonujemy jednorazowo, aby stworzyć i wypełnić naszą bazę danych.

1.  **Zadanie 1.1: Stworzenie skryptu importującego.**
    *   Utwórz nowy plik, np. `tools/importers/import_market_data.py`.
    *   Użyj wbudowanej biblioteki `sqlite3` oraz `json`.

2.  **Zadanie 1.2: Implementacja logiki skryptu.**
    *   Skrypt powinien:
        a. Otworzyć (lub stworzyć, jeśli nie istnieje) plik bazy danych, np. `apps/electron/data/faktoria.sqlite`.
        b. Wykonać zapytania `CREATE TABLE` dla tabel `aukcje` i `zlecenia_kupna` (zgodnie ze schematem powyżej).
        c. Otworzyć plik `Aries-Aukcje.json`, sparsować go i dla każdego obiektu wykonać `INSERT INTO aukcje ...`.
        d. Powtórzyć proces dla `Aries-Kupno.json` i tabeli `zlecenia_kupna`.
        e. Zamknąć połączenie z bazą.

3.  **Zadanie 1.3: Uruchomienie skryptu.**
    *   Uruchom skrypt, aby wygenerować plik `faktoria.sqlite`. Upewnij się, że plik znajduje się w katalogu dostępnym dla procesu Electrona.

#### Faza 2: Integracja z Backendem (Proces Główny Electron)

Tutaj "nauczymy" aplikację desktopową, jak komunikować się z nową bazą danych.

1.  **Zadanie 2.1: Dodanie zależności do obsługi SQLite.**
    *   Zainstaluj w projekcie bibliotekę do obsługi SQLite w Node.js. Rekomenduję `better-sqlite3`, ponieważ jest szybka i ma prostsze, synchroniczne API, co ułatwia pracę w Electronie.
    ```bash
    pnpm install better-sqlite3 --save-dev -w
    pnpm install @types/better-sqlite3 --save-dev -w
    ```

2.  **Zadanie 2.2: Stworzenie modułu do obsługi bazy danych.**
    *   W katalogu `apps/electron/` stwórz nowy plik, np. `database.ts`.
    *   W tym pliku umieść logikę odpowiedzialną za:
        *   Otwieranie połączenia z plikiem `faktoria.sqlite`.
        *   Definiowanie funkcji do wykonywania zapytań, np. `getAuctions(limit, offset)` czy `getBuyOrders()`.
    *   *Przykład (`apps/electron/database.ts`):*
        ```typescript
        import Database from 'better-sqlite3';
        import path from 'path';

        // Ścieżka do bazy danych
        const dbPath = path.join(__dirname, 'data', 'faktoria.sqlite');
        const db = new Database(dbPath, { readonly: true });

        export function getMarketData() {
          const stmt = db.prepare('SELECT * FROM aukcje LIMIT 50');
          return stmt.all();
        }
        ```

3.  **Zadanie 2.3: Implementacja nasłuchu IPC.**
    *   W głównym pliku procesu Electron (prawdopodobnie `apps/electron/main.ts`) dodaj obsługę zapytań przychodzących z frontendu.
    *   *Przykład (`apps/electron/main.ts`):*
        ```typescript
        import { ipcMain } from 'electron';
        import { getMarketData } from './database';

        // ... w funkcji inicjującej aplikację
        ipcMain.handle('get-market-data', async (event, args) => {
          try {
            const data = getMarketData(); // Wywołanie funkcji z modułu bazy danych
            return { success: true, data: data };
          } catch (error) {
            console.error(error);
            return { success: false, error: error.message };
          }
        });
        ```

#### Faza 3: Integracja z Frontendem (Angular)

Teraz połączymy komponent `FaktoriaPageComponent` z backendem Electrona.

1.  **Zadanie 3.1: Modyfikacja `ElectronService`.**
    *   W serwisie, który odpowiada za komunikację z Electronem (np. `electron.service.ts`), dodaj nową metodę do pobierania danych z giełdy.
    *   *Przykład (`electron.service.ts`):*
        ```typescript
        // Upewnij się, że masz dostęp do ipcRenderer
        // Może to wymagać użycia preload script, w zależności od konfiguracji bezpieczeństwa Electrona

        public getMarketData(): Promise<any> {
          if (this.isElectron) {
            // 'get-market-data' to nazwa kanału, który zdefiniowaliśmy w main.ts
            return this.ipcRenderer.invoke('get-market-data');
          }
          return Promise.reject(new Error('Not in Electron environment'));
        }
        ```

2.  **Zadanie 3.2: Aktualizacja `FaktoriaPageComponent`.**
    *   Wstrzyknij `ElectronService` do komponentu.
    *   W metodzie `ngOnInit` (lub innej odpowiedniej) wywołaj nową funkcję, aby pobrać dane.
    *   Przekaż pobrane dane do `FaktoriaTableAdapter` w celu wyświetlenia ich w tabeli.
    *   *Przykład (`faktoria-page.component.ts`):*
        ```typescript
        import { Component, OnInit } from '@angular/core';
        import { ElectronService } from '...'; // Zaimportuj serwis

        @Component({ /* ... */ })
        export class FaktoriaPageComponent implements OnInit {
          constructor(private electronService: ElectronService) {}

          async ngOnInit() {
            const response = await this.electronService.getMarketData();
            if (response.success) {
              console.log('Otrzymano dane:', response.data);
              // Tutaj przekaż response.data do adaptera tabeli
              // np. this.faktoriaTableAdapter.updateData(response.data);
            } else {
              console.error('Błąd pobierania danych:', response.error);
            }
          }
        }
        ```

#### Faza 4: Uruchomienie i Testowanie

1.  **Zadanie 4.1: Uruchomienie aplikacji w trybie Electron.**
    *   Użyj odpowiedniego skryptu z `package.json`, np. `pnpm dev:electron`.

2.  **Zadanie 4.2: Weryfikacja.**
    *   Sprawdź, czy aplikacja uruchamia się bez błędów.
    *   Przejdź na stronę `/faktoria`.
    *   Sprawdź, czy tabela (Ag-Grid) wypełnia się danymi pobranymi z bazy SQLite.
    *   Otwórz narzędzia deweloperskie Electrona i sprawdź konsolę pod kątem ewentualnych błędów.

### 5. Potencjalne Ryzyka i Uwagi

*   **Bundling `better-sqlite3`:** Jest to moduł natywny. Może być konieczne użycie `electron-rebuild`, aby upewnić się, że jest on poprawnie skompilowany dla wersji Node.js używanej przez Electron.
*   **Wydajność:** Przesyłanie bardzo dużych ilości danych przez IPC może być wolne. Od początku warto zaimplementować w backendzie paginację (`LIMIT`/`OFFSET` w SQL), którą frontend będzie mógł kontrolować.
*   **Ścieżki do plików:** Unikaj sztywnych ścieżek. Używaj `path.join` i dynamicznych ścieżek, np. `app.getPath('userData')`, aby zapewnić, że aplikacja będzie działać na różnych komputerach.
*   **Bezpieczeństwo:** Upewnij się, że komunikacja IPC jest bezpieczna, zwłaszcza jeśli `contextIsolation` jest włączone (co jest domyślną i zalecaną opcją). W takim przypadku `ipcRenderer` musi być udostępniony przez skrypt preload.