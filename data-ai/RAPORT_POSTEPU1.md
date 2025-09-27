# Raport Postępu Prac - Migracja Bazy Danych

*Data: 25.09.2025*

Ten dokument podsumowuje prace wykonane w ramach refaktoryzacji warstwy bazy danych oraz definiuje status projektu i dalsze kroki.

---

## 1. Cel Projektu

Głównym celem było zmigrowanie mechanizmu przechowywania danych rynkowych z `Dexie.js` (IndexedDB) na **bazę danych SQLite** działającą w przeglądarce dzięki WebAssembly (WASM). Celem była poprawa wydajności przy obsłudze dużych zbiorów danych poprzez przeniesienie logiki zapytań z kodu JavaScript do silnika SQL.

---

## 2. Ukończone Zadania

### Etap 1: Implementacja Warstwy Danych SQLite
- **Zintegrowano bibliotekę `sql.js`:** Dodano do projektu zależność `sql.js` oraz jej definicje typów.
- **Stworzono `SqliteService`:** Utworzono nowy, centralny serwis (`apps/web/app/data/sqlite.service.ts`) odpowiedzialny za:
  - Inicjalizację silnika SQLite z pliku WASM.
  - Zarządzanie instancją bazy danych.
  - Tworzenie schematu tabeli `market_data`.
  - Udostępnianie mechanizmu powiadomień (`RxJS Subject`) o zmianach w bazie danych w celu zachowania reaktywności.

### Etap 2: Refaktoryzacja Logiki Aplikacji
- **Migracja zapisu danych:** Zmodyfikowano `MarketDataService` (`apps/web/app/widgets/price-importer/market-data.service.ts`), aby zapisywał dane do bazy SQLite przy użyciu transakcji i zapytań `INSERT`, zastępując poprzednią implementację opartą na `Dexie.js`.
- **Migracja odczytu danych:** Całkowicie przebudowano `FaktoriaTableAdapter` (`apps/web/app/widgets/data/faktoria-table/faktoria-table-adapter.ts`). Usunięto logikę pobierania całej tabeli do pamięci i przetwarzania jej w JavaScripcie. Zastąpiono ją jednym, wydajnym zapytaniem SQL, które wykonuje wszystkie operacje (grupowanie, sortowanie, wybieranie najnowszych wpisów) bezpośrednio w silniku bazy danych.

### Etap 3: Rozwiązywanie Problemów z Procesem Budowania
Podczas integracji `sql.js` napotkano serię złożonych problemów z systemem budowania Angulara (Vite), które wymagały wielu iteracji i poprawek. Główne problemy i ich ostateczne rozwiązania:
- **Problem:** Biblioteka `sql.js` próbowała załadować wbudowany moduł Node.js (`crypto`), co powodowało błędy kompilacji i błędy w przeglądarce.
- **Rozwiązanie:**
  1. W `angular.json` dodano `crypto` do `externalDependencies`, aby naprawić błąd kompilacji.
  2. W pliku `apps/web/polyfills.ts` dodano import biblioteki `crypto-browserify`, aby dostarczyć przeglądarkową implementację modułu `crypto` i naprawić błąd w trakcie działania aplikacji.
- **Problem:** Występowały liczne konflikty wersji zależności (m.in. `@angular/animations`, `@babylonjs`).
- **Rozwiązanie:** Wszystkie pakiety Angulara oraz `babylonjs` zostały zaktualizowane do spójnych, kompatybilnych wersji.

---

## 3. Aktualny Stan Projektu

**Wszystkie zaplanowane prace refaktoryzacyjne zostały zakończone.** Aplikacja jest w stanie, w którym powinna się poprawnie kompilować i uruchamiać. Ostatnie logi z serwera deweloperskiego nie wykazały błędów kompilacji.

---

## 4. Następne Kroki (Do Zrobienia)

**Najbliższym i kluczowym zadaniem jest pełne przetestowanie funkcjonalne wprowadzinych zmian.**

1.  **Uruchomienie serwera:** Uruchom serwer deweloperski za pomocą polecenia `pnpm dev`.
2.  **Weryfikacja w przeglądarce:**
    - Sprawdź, czy aplikacja ładuje się w całości bez błędów w konsoli deweloperskiej (F12).
    - Przejdź do podstrony `/faktoria`.
    - Spróbuj zaimportować jeden lub więcej plików JSON z danymi rynkowymi.
    - Sprawdź, czy dane poprawnie wyświetlają się w tabeli.
    - Zweryfikuj, czy sortowanie i filtrowanie (jeśli dotyczy) wciąż działają.
3.  **Naprawa ewentualnych błędów:** Jeśli podczas testów pojawią się błędy, należy je zdiagnozować i naprawić.

---

## 5. Znane Błędy / Potencjalne Problemy do Weryfikacji

- Na ten moment **nie ma zidentyfikowanych błędów** w nowej implementacji, ponieważ nie została ona jeszcze w pełni przetestowana funkcjonalnie.
- Należy zwrócić szczególną uwagę na **pierwsze ładowanie danych** i upewnić się, że baza danych jest poprawnie tworzona i zapisywana.
- Warto zweryfikować, czy formatowanie danych (ceny, daty) w tabeli jest wciąż poprawne.
