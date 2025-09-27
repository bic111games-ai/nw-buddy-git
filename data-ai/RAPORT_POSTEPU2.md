# Raport Postępu Prac - Naprawa Błędów Uruchomieniowych

*Data: 26.09.2025*

Ten dokument podsumowuje prace wykonane w celu naprawy błędów uniemożliwiających uruchomienie aplikacji po migracji na bazę danych SQLite.

---

## 1. Cel Projektu

Głównym celem było doprowadzenie aplikacji do stanu, w którym serwer deweloperski uruchamia się poprawnie, a sama aplikacja działa w przeglądarce bez błędów krytycznych. Pozwoli to na rozpoczęcie testów funkcjonalnych nowej implementacji opartej o SQLite.

---

## 2. Podjęte Działania i Analiza

Po uruchomieniu serwera deweloperskiego zidentyfikowano serię błędów związanych z brakiem obsługi modułów Node.js w środowisku przeglądarki, głównie modułu `crypto` wymaganego przez bibliotekę `sql.js`.

### Przebieg Prac Naprawczych:

1.  **Weryfikacja `angular.json`:** Stwierdzono, że opcja `externalDependencies` z wpisem `"crypto"` jest niepoprawna dla kodu klienckiego i powoduje błędy w przeglądarce. Została usunięta, co prawidłowo przeniosło błąd z przeglądarki do etapu budowania.

2.  **Próba użycia pola `browser` w `package.json`:** Podjęto próbę zdefiniowania aliasu dla modułu `crypto` za pomocą standardowego pola `"browser"`. Ta metoda, mimo że teoretycznie poprawna, została zignorowana przez system budowania Angulara, nawet po wyczyszczeniu pamięci podręcznej (`.vite` i `.angular/cache`).

3.  **Analiza błędu `global is not defined`:** Po kolejnych próbach błąd budowania został zastąpiony błędem w przeglądarce: `Uncaught ReferenceError: global is not defined`. Wskazywało to na problem z kolejnością ładowania skryptów – moduły (`crypto-browserify`) były wykonywane, zanim zdefiniowano potrzebne im zmienne globalne.

4.  **Finalna implementacja Polyfills:**
    *   Wycofano wszystkie poprzednie, nieudane zmiany (usunięcie dodatkowych skryptów i wpisów w `angular.json` oraz `package.json`), aby zapewnić czysty stan projektu.
    *   W pliku `apps/web/polyfills.ts` umieszczono definicje dla `window.global` i `window.process` na samej górze, przed wszystkimi importami. Taka kolejność gwarantuje, że te kluczowe zmienne globalne będą dostępne dla każdego modułu, który będzie ich potrzebował podczas ładowania.

---

## 3. Aktualny Stan Projektu

**Projekt jest w stanie gotowości do kolejnej próby uruchomienia.** Wszystkie znane problemy konfiguracyjne związane z polyfillami dla Node.js zostały zaadresowane w ramach ostatniej zmiany w pliku `polyfills.ts`.

--- 

## 4. Następne Kroki (Do Zrobienia)

**Kluczowym zadaniem jest weryfikacja ostatniej wprowadzonej poprawki.**

1.  **Uruchomienie serwera:** Uruchom serwer deweloperski za pomocą polecenia `pnpm dev`.
2.  **Weryfikacja w przeglądarce:**
    *   Sprawdź, czy aplikacja ładuje się bez błędów `crypto` lub `global` w konsoli deweloperskiej (F12).
    *   Jeśli aplikacja się uruchomi, przejdź do testów funkcjonalnych opisanych w `RAPORT_POSTEPU1.md` (import danych na stronie `/faktoria` i weryfikacja ich wyświetlania).
3.  **Dalsze naprawy:** Jeśli błąd `crypto`/`global` nadal występuje, konieczna będzie dalsza diagnostyka. Jeśli został rozwiązany, należy zająć się problemami niższej wagi, takimi jak ostrzeżenia o `browserslist` i pseudo-klasie `:is`.
