# Raport Postępu Prac - Projekt Faktoria

*Data: 25.09.2025*

Ten dokument podsumowuje dotychczasowy postęp prac, aktualny stan projektu oraz planowane następne kroki.

## 1. Cel Projektu

Głównym celem projektu jest rozbudowa aplikacji NW-Buddy o nową sekcję o nazwie "Faktoria". Sekcja ta ma za zadanie prezentować i analizować duże ilości danych rynkowych (ceny aukcji i zleceń kupna) importowanych z plików JSON.

---

## 2. Ukończone Zadania

Zakończono implementację kluczowych funkcjonalności opisanych w `zalozenia.md` w Etapie 1 i 2.

### Etap 1: Interfejs Użytkownika

- **Stworzenie strony `/faktoria`:** Pomyślnie utworzono nową podstronę, dostępną pod adresem `/faktoria`.
- **Struktura tabeli:** Skopiowano układ tabeli ze strony `/items` i dodano nowe, dedykowane kolumny dla danych rynkowych.
- **Nawigacja:** Dodano link do nowej strony w głównym menu aplikacji w kategorii "DB", zapewniając łatwy dostęp.

### Etap 2: Zarządzanie Danymi

- **Import wielu plików:** Zmodyfikowano istniejący importer cen, aby umożliwiał jednoczesne przesyłanie i przetwarzanie wielu plików JSON.
- **Stworzenie lokalnej bazy danych:**
  - W lokalnej bazie danych aplikacji (IndexedDB zarządzanej przez Dexie.js) utworzono nową tabelę `market_data` przeznaczoną do przechowywania historycznych danych rynkowych.
  - Zaimplementowano logikę zapisu (`bulkPut`), która efektywnie importuje dane z plików do nowej tabeli.
- **Integracja danych z tabelą:**
  - Zrefaktoryzowano adapter tabeli (`FaktoriaTableAdapter`), aby dynamicznie (`liveQuery`) pobierał dane z nowej tabeli `market_data`.
  - Tabela `/faktoria` wyświetla teraz **tylko i wyłącznie** przedmioty, dla których istnieją dane w bazie `market_data`.
- **Logika wyświetlania i formatowanie:**
  - Zaimplementowano logikę, która dla każdego przedmiotu wybiera i wyświetla tylko **najnowszy** dostępny wpis, bazując na dacie `created_at`.
  - Sformatowano wyświetlanie cen (podzielenie przez 100 i formatowanie do dwóch miejsc po przecinku).
  - Sformatowano wszystkie daty do bardziej czytelnej postaci `RRRR-MM-DD`.
  - Zmieniono nagłówki kolumn na język polski.
  - Ustawiono domyślną widoczność tylko dla kluczowych kolumn, zgodnie z wytycznymi.

---

## 3. Aktualny Stan Projektu

**Aplikacja jest w pełni funkcjonalna i stabilna.**

Kluczowe założenia projektowe zostały zrealizowane. Użytkownik może importować wiele plików z danymi rynkowymi, które są zapisywane w lokalnej bazie danych. Strona `/faktoria` poprawnie odczytuje te dane, filtruje je w celu pokazania tylko najnowszych wpisów i prezentuje je w sformatowanej tabeli z odpowiednimi nagłówkami i domyślną widocznością kolumn.

---

## 4. Następne Kroki

Użytkownik podjął strategiczną decyzję o dalszym rozwoju aplikacji w celu zapewnienia jej długoterminowej wydajności przy bardzo dużych zbiorach danych, które będą gromadzone lokalnie.

**Najbliższy planowany etap to refaktoryzacja warstwy bazy danych.**

- **Cel:** Migracja z obecnego rozwiązania (Dexie.js opakowującego IndexedDB) na **bazę danych SQLite** działającą w przeglądarce dzięki technologii WebAssembly (WASM).
- **Uzasadnienie:** SQLite oferuje pełne możliwości języka SQL, co pozwoli na znacznie wydajniejsze wykonywanie złożonych zapytań i agregacji danych bezpośrednio w silniku bazy danych. Jest to optymalne rozwiązanie dla lokalnej aplikacji, która ma przetwarzać rosnące, duże zbiory danych.
- **Status:** Prace nad tym etapem rozpoczną się na nowej kopii projektu, aby nie zakłócać obecnej, stabilnej wersji.

---

## 5. Napotkane Problemy i Rozwiązania

Podczas implementacji napotkano kilka problemów technicznych, które zostały pomyślnie rozwiązane:

- **Błędy routingu:** Poprawiono nieprawidłowe ścieżki importu komponentów.
- **Zależności cykliczne (Circular Dependency):** Rozwiązano konflikty w systemie wstrzykiwania zależności Angulara poprzez refaktoryzację lokalizacji i sposobu dostarczania serwisów.
- **Problemy z aktualizacją schematu bazy danych:** Błędy związane z `Dexie.js` zostały rozwiązane przez poinstruowanie użytkownika o konieczności ręcznego wyczyszczenia bazy danych w narzędziach deweloperskich przeglądarki, co wymusiło stworzenie schematu na nowo.
- **Niezgodność mapowania danych:** Poprawiono logikę mapowania pól (np. `item_id` na `itemId`), aby zapewnić spójność między danymi z plików JSON a modelem danych w aplikacji.
