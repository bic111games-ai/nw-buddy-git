# Raport z postępu prac - 26.09.2025

## Cel

Celem było zdiagnozowanie i naprawienie błędów kompilacji, które uniemożliwiały uruchomienie aplikacji w trybie deweloperskim. Główne problemy dotyczyły nierozwiązanych zależności modułów Node.js (np. `stream`) oraz aliasów ścieżek (np. `~/ui/...`).

## Podjęte działania

1.  **Analiza błędów**: Zidentyfikowano dwa główne typy błędów w logach kompilacji:
    *   `Could not resolve "stream"`: Błąd wskazujący na próbę użycia wbudowanego modułu Node.js w środowisku przeglądarki.
    *   `Could not resolve "~/..."`: Błąd wskazujący, że system budowania (esbuild) nie rozpoznaje aliasów ścieżek zdefiniowanych w plikach `tsconfig.json`.

2.  **Próby naprawy aliasów (`tsconfig.json`)**:
    *   Modyfikowano plik `apps/web/tsconfig.app.json`, dodając mapowanie dla modułów Node.js. Nie przyniosło to rezultatu.
    *   Modyfikowano główny plik `tsconfig.json`, dodając i precyzując mapowania dla aliasów lokalnych (`~/*`, `~/ui/*` itd.). Ta próba również zakończyła się niepowodzeniem.
    *   Przeniesiono konfigurację `paths` i `baseUrl` do pliku `apps/web/tsconfig.json`, dostosowując ścieżki. To również nie rozwiązało problemu.

3.  **Próba naprawy przez ścieżki względne**:
    *   W ramach obejścia problemu, w pliku `weapon-definitions-page.component.ts` zamieniono wszystkie importy używające aliasu `~` na ścieżki względne. To działanie było skuteczne dla tego jednego pliku, ale jest niepraktyczne jako rozwiązanie całościowe.

4.  **Próby naprawy polifillów (`stream`)**:
    *   Dodano wpis `(window as any).stream = require('stream-browserify');` do pliku `apps/web/polyfills.ts`, aby ręcznie wstrzyknąć brakujący moduł. Ta zmiana również nie przyniosła oczekiwanego efektu, ponieważ problem leży na etapie budowania, zanim polifille są ładowane w przeglądarce.

5.  **Przywrócenie zmian**:
    *   Na prośbę użytkownika, wszystkie wprowadzone zmiany w kodzie zostały cofnięte za pomocą komendy `git restore`. Przywrócono stan plików do wersji z ostatniego commita.

## Obecny stan

*   Aplikacja wciąż nie kompiluje się poprawnie, a logi błędów wskazują na te same, nierozwiązane problemy z aliasami ścieżek i modułami Node.js.
*   Wszystkie moje dotychczasowe modyfikacje zostały wycofane, więc projekt znajduje się w stanie wyjściowym (sprzed moich interwencji).

## Dalsze kroki

Konieczna jest ponowna, głębsza analiza konfiguracji budowania w pliku `angular.json` oraz interakcji `esbuild` z aliasami `tsconfig`. Prawdopodobnie standardowe mechanizmy Angular CLI nie działają w tym konkretnym przypadku, co może być spowodowane złożoną strukturą monorepo. Następnym krokiem powinno być zbadanie możliwości użycia niestandardowego pluginu do `esbuild`, który jawnie obsłuży resolucję aliasów.